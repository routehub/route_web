import { Component, ViewChild, ElementRef } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  @ViewChild('map') map_elem: ElementRef;
  map: any;

  ionViewWillEnter() {
    this.map.resize();
  }

  ngOnInit() {
    // tslint:disable-next-line:no-unused-expression
    this.map = new mapboxgl.Map({
      container: this.map_elem.nativeElement,
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
      zoom: 9,
      trackResize: true
    });

    // tslint:disable-next-line:no-unused-expression
    const Draw: any = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        point: true,
        trash: true
      },
      styles: [
        {
          'id': 'gl-draw-line',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true'], ['!=', 'mode', 'static']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': 'rgba(0,0,255,0.5)',
            // 'line-dasharray': [0.2, 2],
            'line-width': 6
          }
        },
        {
          'id': 'gl-draw-line-disable',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['==', 'active', 'false'], ['!=', 'mode', 'static']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': 'rgba(0,0,255,0.2)',
            // 'line-dasharray': [0.2, 2],
            'line-width': 6
          }
        }
      ]
    });
    this.map.addControl(Draw, 'top-right');
    this.map.on('load', function () {
      // ALL YOUR APPLICATION CODE

    });
    this.map.on('draw.create', function (e) {
      let data = Draw.getAll();
      console.dir(data);
    });

  }
}
