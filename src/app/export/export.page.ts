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
    const { Point } = GarminBuilder.MODELS;
    const points = [
      new Point(51.02832496166229, 15.515156626701355, {
        ele: 314.715,
        time: new Date('2018-06-10T17:29:35Z'),
        hr: 120,
      }),
      new Point(51.12832496166229, 15.615156626701355, {
        ele: 314.715,
        time: new Date('2018-06-10T17:39:35Z'),
        hr: 121,
      }),
    ];

    const gpxData = new GarminBuilder();

    gpxData.setSegmentPoints(points);

    console.log(buildGPX(gpxData.toObject()));
    /*
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    //    a.href = url;
    //    a.download = title;
    a.click();
    //    window.URL.revokeObjectURL(url);
    */
  }
}