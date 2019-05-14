import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-layerselect',
  templateUrl: './layerselect.page.html',
  styleUrls: ['./layerselect.page.scss'],
})
export class LayerselectPage implements OnInit {

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
  }

  changeLayer(index:number) {
    console.dir(index);
    var layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0];
    layerControlElement.getElementsByTagName('input')[index].click();
  }
  async closeModal() {
    await this.modalController.dismiss();
  }
}
