import { element } from 'protractor';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { IonTitle } from '@ionic/angular';
import * as L from 'leaflet';
import 'leaflet.elevation/dist/leaflet.elevation-0.0.2.min.js'
import turfbbox from '@turf/bbox';
import * as turf from '@turf/helpers';

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
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type": "LineString",
                "coordinates": [
                  //              [-122.48369693756104, 37.83381888486939],              
                ]
              }
            }
          ]
        }
      },
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": "#0000ff",
        "line-width": 6,
        "line-opacity": 0.7,
      }
    }

  }

  ionViewWillEnter() {
    let center: any = [35.681, 139.767];
    this.map = L.map(this.map_elem.nativeElement, { center: center, zoom: 9 });
    let yahoo = L.tileLayer('https://map.c.yimg.jp/m?x={x}&y={y}&z={z}&r=1&style=base:standard&size=512');
    // FIXME: 実行時にもとクラスの定義を書き換えちゃってる
    yahoo.__proto__.getTileUrl = function (coord) {
      let z = coord.z + 1;
      let x = coord.x;
      let y = Math.pow(2, coord.z - 1) - coord.y - 1;
      return 'https://map.c.yimg.jp/m?x=' + x + '&y=' + y + '&z=' + z + '&r=1&style=base:standard&size=512';
    }
    yahoo.addTo(this.map);

    // elevation
    var el = L.control.elevation({
      position: 'bottomright',
      theme: 'steelblue-theme',
      width: window.innerWidth,
      height: 100,
      margins: {
        top: 20,
        right: 30,
        bottom: 20,
        left: 40
      },
      useHeightIndicator: true,
    });
    el.addTo(this.map);

    const id = this.route.snapshot.paramMap.get('id');
    var that = this;
    this.get(id).then(function (route: any) {
      // タイトル変更
      that.title.el.innerText = route.title;
      // 線を引く
      let pos = route.pos.split(',').map(p => { return p.split(' ') });
      // 標高も足しておく
      let level = route.level.split(',');
      for (var i = 0; i < level.length; i++) {
        pos[i].push(level[i] * 1);
      }

      that.route_geojson.source.data.features[0].geometry.coordinates = pos;
      L.geoJSON(that.route_geojson.source.data, {
        "color": "#0000ff",
        "width": 6,
        "opacity": 0.7,
        onEachFeature: el.addData.bind(el)
      }).addTo(that.map);

      // 描画範囲をよろしくする
      let line = turf.lineString(pos);
      let bbox = turfbbox(line); // lonlat問題...
      that.map.fitBounds([
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]]
      ]);

    });

  }

  public get(id): Promise<any[]> {
    let geturl = 'http://153.127.254.245/route/1.0.0/route';
    return this.http.get(geturl + '?id=' + id).toPromise()
      .then((res: any) => {
        if (!res.results) {
          return;
        }
        return res.results;
      });
  }

  // TODO : 標高グラフはこれを使う
  //  https://github.com/MrMufflon/Leaflet.Elevation/blob/master/src/L.Control.Elevation.js


}
