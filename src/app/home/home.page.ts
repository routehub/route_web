import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { Events } from '../Events'
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
    window.document.title = 'RouteHub(β)';

    if (!this.platform.is('mobile')) {
      return;
    }

    let that = this;

    this.storage.get('user').then((json) => {
      if (!json || json == "") {
        return;
      }
      let user = JSON.parse(json);
      that.photoURL = user.photo_url;
      that.logoutButton.el.style.display = 'block';
      that.logoutButton.el.style.color = '#ffffff9c';
      that.logoutButton.el.style.background = 'white';
    });
  }

  search() {
    this.navCtrl.navigateForward('/list?query=' + this.query + '&');
  }

  logout() {
    this.events.publish('user:logout', {});
    this.logoutButton.el.style.display = 'none';
    this.loginButton.el.style.display = 'block';

  }
  toLoginPage() {
    this.events.publish('user:toLoginPage', {});
  }
}
