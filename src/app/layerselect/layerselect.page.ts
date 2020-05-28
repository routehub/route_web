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
    map.once('styledata', () => {
      new RoutemapMapbox().renderRouteLayer(map, RoutemapMapbox.routeLayer, 'height')
    })

    switch (index) {
      case 0:
        map.setStyle(RoutemapMapbox.createRasterTile(rasterStyleInfo.DEFAULT))
        break
      case 1:
        map.setStyle(RoutemapMapbox.createRasterTile(rasterStyleInfo.OSM))
        break
      case 2:
        map.setStyle(RoutemapMapbox.createRasterTile(rasterStyleInfo.OPEN_CYCLE_LAYER))
        break
      case 4:
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
