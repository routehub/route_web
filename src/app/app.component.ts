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
    private http: HttpClient,
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

  initializeAuth() {
    // 現在のログイン状態を確認
    this.user = this.auth.auth.currentUser;

    this.auth.authState.subscribe(async (user) => {
      if (user) {
        let token = await user.getIdToken();
        const url = environment.api.host + environment.api.user_path;
        let nickname = await this.http.get(url + '?firebase_id_token=' + token).toPromise()
          .then((res: any) => {
            if (!res || !res[0] || res[0].display_name) {
              return "";
            }
            return res[0].display_name;
          });

        this.user = user;
        let rhuser = new RouteHubUser(
          user.uid,
          nickname + "",
          user.displayName,
          user.photoURL,
          user.providerData[0].providerId,
          token,
        );

        this.storage.set('user', JSON.stringify(rhuser));
        // TODO : 画像が設定されていない場合はデフォ画像を入れたい
        // TODO : ログインのexpireをstorageに入れるべきでは?
      } else {
        this.user = null;
        this.storage.remove('user');
      }
    });
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
