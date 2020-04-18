import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'

@Component({
  selector: 'app-layerselect',
  templateUrl: './layerselect.page.html',
  styleUrls: ['./layerselect.page.scss'],
})
export class LayerselectPage implements OnInit {
  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  changeLayer(index: number) {
    const layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0]
    layerControlElement.getElementsByTagName('input')[index].click()
  }

  async closeModal() {
    await this.modalController.dismiss()
  }
}
