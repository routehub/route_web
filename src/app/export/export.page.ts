import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { buildGPX, GarminBuilder } from 'gpx-builder';

@Component({
  selector: 'app-export',
  templateUrl: './export.page.html',
  styleUrls: ['./export.page.scss'],
})
export class ExportPage implements OnInit {

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) { }

  ngOnInit() {
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  exportGpx() {
    const route = this.navParams.get('route');
    console.dir(route);
    const { Metadata, Person, Point } = GarminBuilder.MODELS;

    const meta = new Metadata({
      name: route.title,
      author: new Person({
        name: route.author,
      }),
      //      link
    })

    var points = [];
    for (let i = 0; i < route.pos.length; i++) {
      let pos = route.pos[i];
      points.push(
        new Point(pos[1], pos[0], {
          ele: pos[2],
          // なにか追加したいデータあればする。
          // time: new Date('2018-06-10T17:29:35Z'),
          // hr: 120,
        }));
    }
    const gpxData = new GarminBuilder();
    gpxData.setMetadata(meta);
    gpxData.setSegmentPoints(points);
    const gpxString = buildGPX(gpxData.toObject());

    var blob = new Blob([gpxString], { "type": "application/gpx+xml" });
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = route.title + '.gpx';
    link.click()
  }
}