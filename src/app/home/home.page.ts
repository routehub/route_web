import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  constructor(
    public platform: Platform,
  ) { }

  ionViewWillEnter() {
  }

  ionViewDidEnter() {
  }
}
