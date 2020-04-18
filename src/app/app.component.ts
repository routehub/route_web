import { Component, OnInit } from '@angular/core'
import { Platform, NavController } from '@ionic/angular'
import { SplashScreen } from '@ionic-native/splash-screen/ngx'
import { StatusBar } from '@ionic-native/status-bar/ngx'
import { AngularFireAuth } from 'angularfire2/auth'
import { User } from 'firebase'
import { Apollo } from 'apollo-angular'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { Events } from './Events'
import { environment } from '../environments/environment'
import { AuthService } from './auth.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit {
  public appPages = [
    {
      title: '検索',
      icon: 'search',
      route: () => { this.navCtrl.navigateForward('/') },
    },
    {
      title: 'gpxアップロード',
      icon: 'cloud-upload-outline',
      route: () => { alert('ルートラボ移行は終了しました。\n一括アップロード機能を開発予定です。'); return false }, // eslint-disable-line
    },
    {
      title: 'ルート作成',
      icon: 'create-outline',
      route: () => { this.navCtrl.navigateForward('/edit') },
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
    private apollo: Apollo,
    private authService: AuthService,
  ) {
    this.initializeApp()
    this.initializeAuth()
  }

  ngOnInit() {
    /**
     * 共通化するイベントの登録
     */
    this.events.subscribe('user:toLoginPage', () => {
      this.toLoginPage()
    })
    this.events.subscribe('user:logout', () => {
      this.logout()
    })
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault()
      this.splashScreen.hide()

      // モバイル出ないときのデザイン調整
      if (!this.platform.is('mobile')) {
        this.tabslot = 'top'
        this.appPages.shift()
      }
    })
  }

  async initializeAuth() {
    this.authService.user.subscribe(async (_user) => {
      // ログイン済みでヘッダをつけてクライアントを作成
      if (!_user) {
        this.user = null
        return
      }

      this.user = _user

      // clientにヘッダーをつける作業&表示名取得
      const token = await _user.getIdToken()
      // apollo client 更新
      this.apollo.removeClient()
      this.apollo.create({
        link: createHttpLink({
          uri: environment.api.graphql_host,
          headers: { token },
        }),
        cache: new InMemoryCache(),
      })
    })
  }

  isLogin() {
    return this.user !== null
  }

  routing() {
    return this.isLogin() ? '/my' : '/login'
  }

  toLoginPage() {
    this.navCtrl.navigateForward('/login')
  }

  logout() {
    this.auth.auth.signOut()
  }

  getUser() {
    return this.user
  }
}
