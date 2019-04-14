import { element } from 'protractor';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { IonTitle } from '@ionic/angular';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.scss'],
})
export class WatchPage implements OnInit {
  @ViewChild('map') map_elem: ElementRef;
  @ViewChild('title') title_elem: ElementRef;

  map: any;
  title: any;
  route_geojson: any;

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
    this.title = this.title_elem;
    this.route_geojson = {
      "id": "route",
      "type": "line",
      "source": {
        "type": "geojson",
        "data": {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": [
              //              [-122.48369693756104, 37.83381888486939],              
            ]
          }
        }
      },
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": "#0000ff",
        "line-width": 3
      }
    }
  }

  ionViewWillEnter() {
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

  }

  ionViewDidEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    var that = this;
    this.get(id).then(function (route: any) {
      // タイトル変更
      that.title.el.innerText = route.title;
      // 線を引く
      let pos = route.pos.split(',').map(p => { return p.split(' ') });
      that.route_geojson.source.data.geometry.coordinates = pos;
      that.map.addLayer(that.route_geojson);

      var bounds = new mapboxgl.LngLatBounds();
      pos.forEach(function (p) {
        bounds.extend(p);
      });
      that.map.fitBounds(bounds, {
        duration: 0,
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      });

    });
  }

  public get(id): Promise<any[]> {
    let geturl = 'http://localhost:8080/route/1.0.0/route';
    return this.http.get(geturl + '?id=' + id).toPromise()
      .then((res: any) => {
        if (!res.results) {
          return;
        }
        return res.results;
      });
  }


}
