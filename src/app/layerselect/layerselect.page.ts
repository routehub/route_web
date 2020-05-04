import { Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { rasterStyleInfo, RoutemapMapbox } from '../watch/routemapMapbox'


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
    const map = RoutemapMapbox.getCurrent()
    switch (index) {
      case 0:
        map.setStyle(RoutemapMapbox.createRasterTile(rasterStyleInfo.OSM))
        break
      case 1:
        map.setStyle(RoutemapMapbox.createRasterTile(rasterStyleInfo.OPEN_CYCLE_LAYER))
        break
      case 3:
        map.setStyle(RoutemapMapbox.createRasterTile(rasterStyleInfo.GSI))
        break
      default:
        map.setStyle(RoutemapMapbox.createRasterTile(rasterStyleInfo.DEFAULT))
        break
    }
  }

  async closeModal() {
    await this.modalController.dismiss()
  }
}
