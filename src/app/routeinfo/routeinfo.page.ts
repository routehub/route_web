import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-routeinfo',
  templateUrl: './routeinfo.page.html',
  styleUrls: ['./routeinfo.page.scss'],
})
export class RouteinfoPage implements OnInit {

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
  }
  async closeModal() {
    await this.modalController.dismiss();
  }
}
