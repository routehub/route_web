import { Component, OnInit } from '@angular/core';
import { Platform, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from 'firebase';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { RouteHubUser } from './model/routehubuser';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  public appPages = [
    {
      title: 'トップ',
      icon: 'home',
      route: () => {
        this.navCtrl.navigateForward('/');
      }
    },
    {
      title: 'ルートを取込',
      icon: 'add', // 'cloud-download'
      route: () => {
        this.navCtrl.navigateForward(this.isLogin() ? '/migration' : '/login');
      }
    },
    {
      title: 'ルートを検索',
      icon: 'search',
      route: () => {
        this.navCtrl.navigateForward('/list');
      }
    }
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
        this.user = user;
        let rhuser = new RouteHubUser(
          user.uid,
          "",
          user.displayName,
          user.photoURL,
          user.providerData[0].providerId,
          await user.getIdToken(),
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
