import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-routeinfo',
  templateUrl: './routeinfo.page.html',
  styleUrls: ['./routeinfo.page.scss'],
})
export class RouteinfoPage implements OnInit {

  route: any;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    this.route = this.navParams.get('route');
  }
  async closeModal() {
    await this.modalController.dismiss();
  }
}
