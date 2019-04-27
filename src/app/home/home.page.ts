import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, Events } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  user;

  constructor(
    public platform: Platform,
    public events: Events,
  ) { }

  ionViewWillEnter() {
    this.user = this.events.publish('user.getUser');
    console.dir(this.user);
  }

  ionViewDidEnter() {
  }

  logout() {
    this.events.publish('user:logout');
  }
  toLoginPage() {
    this.events.publish('user:toLoginPage');
  }
}
