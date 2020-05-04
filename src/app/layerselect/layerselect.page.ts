import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { Routemap, rasterStyleInfo } from '../watch/routemap'

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
    const map = Routemap.getCurrent()
    switch (index) {
      case 0:
        map.setStyle(Routemap.createRasterTile(rasterStyleInfo.OSM))
        break
      case 1:
        map.setStyle(Routemap.createRasterTile(rasterStyleInfo.OPEN_CYCLE_LAYER))
        break
      case 3:
        map.setStyle(Routemap.createRasterTile(rasterStyleInfo.GSI))
        break
      default:
        map.setStyle(Routemap.createRasterTile(rasterStyleInfo.DEFAULT))
        break
    }
  }

  async closeModal() {
    await this.modalController.dismiss()
  }
}
