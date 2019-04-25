import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    {
      title: 'トップ',
      url: '/',
      icon: 'home'
    },
    {
      title: 'ルートを取込',
      url: '/migration',
      icon: 'add'//'cloud-download'
    },
    {
      title: 'ルートを検索',
      url: '/list',
      icon: 'search'
    }
  ];

  public tabslot = 'top';

  constructor(
    public platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // モバイル出ないときのデザイン調整
      if (!this.platform.is('mobile')) {
        this.tabslot = 'top';
        console.log('is pc');
      }
    });
  }
}
