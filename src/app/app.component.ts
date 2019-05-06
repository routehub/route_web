import { Component, OnInit } from '@angular/core';
import { Platform, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from 'firebase';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

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
      title: 'ルートラボ取込',
      icon: 'cloud-download',
      route: () => {
        this.navCtrl.navigateForward(this.isLogin() ? '/migration' : '/login');
      }
    },
    {
      title: 'ルート作成',
      icon: 'add',
      route: () => {
        window.alert('作成中ですぅ')
      }
    },
    {
      title: '検索',
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

    this.auth.authState.subscribe((user) => {
      if (user) {
        console.log('login done');
        this.user = user;
        this.storage.set('user.uid', user.uid);
        this.storage.set('user.displayName', user.displayName);
        // TODO : 画像が設定されていない場合はデフォ画像を入れたい
        this.storage.set('user.photoURL', user.photoURL);

        // TODO : ログインのexpireをstorageに入れるべきでは?

      } else {
        console.log('logout done');
        this.user = null;

        this.storage.remove('user.uid');
        this.storage.remove('user.displayName');
        this.storage.remove('user.photoURL');
        // No user is signed in.
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
