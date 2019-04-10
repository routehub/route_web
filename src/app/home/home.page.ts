import { Component, ViewChild, ElementRef } from '@angular/core';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  @ViewChild('map') map: ElementRef;

  ionViewDidEnter() {
    // tslint:disable-next-line:no-unused-expression
    new mapboxgl.Map({
      container: this.map.nativeElement,
      style: {
        version: 8,
        sources: {
          OSM: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'OSM',
            type: 'raster',
            source: 'OSM',
            minzoom: 0,
            maxzoom: 18
          }
        ]
      },
      center: [139.767, 35.681],
      zoom: 9
    });
  }
}
