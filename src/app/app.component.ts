import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from 'firebase';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { RouteHubUser } from './model/routehubuser';
import { environment } from '../environments/environment';
import { Events } from './Events'
import gql from 'graphql-tag';

import { Apollo, ApolloModule } from 'apollo-angular';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  public appPages = [
    {
      title: '検索',
      icon: 'search',
      route: () => { this.navCtrl.navigateForward('/') }
    },
    {
      title: 'ルートラボ移行',
      icon: 'cloud-upload-outline',
      route: () => { this.navCtrl.navigateForward(this.isLogin() ? '/migration' : '/login') }
    },
    {
      title: '作成',
      icon: 'create-outline',
      route: () => { this.navCtrl.navigateForward('/edit') }
    },
  ];

  public tabslot = 'top';
  public user: User;

  constructor(
    public platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public auth: AngularFireAuth,
    private navCtrl: NavController,
    public events: Events,
    private storage: Storage,
    private apollo: Apollo,
  ) {
    this.initializeApp();
    this.initializeAuth();
  }

  ngOnInit() {
    /**
     * 共通化するイベントの登録
     */
    this.events.subscribe('user:toLoginPage', () => {
      this.toLoginPage();
    });
    this.events.subscribe('user:logout', () => {
      this.logout();
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // モバイル出ないときのデザイン調整
      if (!this.platform.is('mobile')) {
        this.tabslot = 'top';
        this.appPages.shift();
      }
    });
  }

  async initializeAuth() {
    // 現在のログイン状態を確認
    this.user = this.auth.auth.currentUser;

    // ログイン済みでヘッダをつけてクライアントを作成
    this.auth.authState.subscribe(async (_user) => {
      if (!_user) {
        this.user = null
        this.storage.remove('user')
        return
      }

      this.user = _user
      let rhuser = new RouteHubUser(
        _user.uid,
        '',
        _user.displayName,
        _user.photoURL,
        _user.providerData[0].providerId,
        '',
      )
      this.storage.set('user', JSON.stringify(rhuser))

      // clientにヘッダーをつける作業&表示名取得
      const token = await _user.getIdToken()
      // apollo client 更新
      this.apollo.removeClient()
      this.apollo.create({
        link: createHttpLink({
          // uri: 'https://routehub-api.herokuapp.com/',
          uri: 'http://localhost:4000/',
          headers: { token: token },
        }),
        cache: new InMemoryCache()
      })
      const graphquery = gql`{ getUser{ display_name  } }`;
      this.apollo.query({
        query: graphquery,
      }).subscribe(({ data }) => {
        const nickname: any = data
        let rhuser = new RouteHubUser(
          _user.uid,
          nickname,
          _user.displayName,
          _user.photoURL,
          _user.providerData[0].providerId,
          token,
        );
        this.storage.set('user', JSON.stringify(rhuser));
      });
    })
  }

  isLogin() {
    return this.user !== null;
  }

  routing() {
    return this.isLogin() ? '/migration' : '/login';
  }

  toLoginPage() {
    this.navCtrl.navigateForward('/login');
  }

  logout() {
    this.auth.auth.signOut();
  }

  getUser() {
    return this.user;
  }
}
