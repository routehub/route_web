import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { RouteModel } from '../model/routemodel';

@Component({
  selector: 'app-routeinfo',
  templateUrl: './routeinfo.page.html',
  styleUrls: ['./routeinfo.page.scss'],
})
export class RouteinfoPage implements OnInit {

  route: RouteModel;

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
    this.route = this.navParams.get('route');
    this.route.body = this.route.body.replace(/\n/g, "<br>");
  }
  async closeModal() {
    await this.modalController.dismiss();
  }

  goLLL() {
    let link = document.createElement('a');
    link.href = "https://latlonglab.yahoo.co.jp/route/watch?id=" + this.route.id;
    link.target = "_blank";
    link.click();
  }
}
