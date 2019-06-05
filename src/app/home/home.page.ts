import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Platform, Events, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  titleimageheight = { height: window.outerHeight + 'px' };

  user;
  photoURL;
  nowCheckLogin = false;
  query = '';
  list_style_class = 'funclist';

  @ViewChild('logoutButton') logoutButton: any;
  @ViewChild('loginButton') loginButton: any;

  constructor(
    public platform: Platform,
    public events: Events,
    private storage: Storage,
    public navCtrl: NavController,
  ) {

  }

  ngOnInit() {
    if (this.platform.is('mobile')) {
      this.list_style_class = '';
    }
  }

  ionViewDidEnter() {
    window.document.title = 'RouteHub';

    if (!this.platform.is('mobile')) {
      return;
    }

    let that = this;
    this.storage.get('user.photoURL').then((photoURL) => {
      if (photoURL == null) {
        throw new Error('not login');
      }
      that.photoURL = photoURL;
      that.logoutButton.el.style.display = 'block';
      that.logoutButton.el.style.color = '#ffffff9c';
    }).catch(e => {
      that.loginButton.el.style.display = 'block';
    });
  }

  search() {
    this.navCtrl.navigateForward('/list?query=' + this.query + '&');
  }

  logout() {
    this.events.publish('user:logout');
    this.logoutButton.el.style.display = 'none';
    this.loginButton.el.style.display = 'block';

  }
  toLoginPage() {
    this.events.publish('user:toLoginPage');
  }
}
