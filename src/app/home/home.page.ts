import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Platform, Events } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  user;
  photoURL;
  nowCheckLogin = false;
  @ViewChild('logoutButton') logoutButton: any;
  @ViewChild('loginButton') loginButton: any;

  constructor(
    public platform: Platform,
    public events: Events,
    private storage: Storage,
  ) {

  }

  ionViewDidEnter() {
    if (!this.platform.is('mobile')) {
      return;
    }

    var that = this;
    this.storage.get('user.photoURL').then((photoURL) => {
      if (photoURL == null) {
        throw new Error('not login');
      }
      that.photoURL = photoURL;
      that.logoutButton.el.style.display = 'block';
      that.logoutButton.el.style.color = '#ffffff00';
    }).catch(e => {
      that.loginButton.el.style.display = 'block';
    });
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
