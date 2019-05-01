import { async } from '@angular/core/testing';
import { LoginPage } from './../login/login.page';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';
// TODO: forkして自前のブランチでマージしてビルドしたやつを利用する
import 'leaflet.elevation/src/L.Control.Elevation.js';
import turfbbox from '@turf/bbox';
import * as turf from '@turf/helpers';
import { RouteinfoPage } from '../routeinfo/routeinfo.page';
import { ExportPage } from '../export/export.page';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.scss'],
})

export class WatchPage implements OnInit {
  @ViewChild('map') map_elem: ElementRef;

  map: any;
  title: any;
  watch_location_subscribe: any;
  watch: any;
  currenPossitionMarker: any;
  elevation_controll: any;
  route_geojson = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": [],
        }
      },
    ],
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#0000ff",
      "line-width": 6,
      "line-opacity": 0.7,
    }
  };

  private route_data = {
    title: '',
    author: '',
    body: '',
    create_at: '',
    pos: [],
    ele: [],
    time: [],
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public platform: Platform,
  ) { }

  ionViewDidEnter() {
    if (this.platform.is('mobile')) {
      window.document.querySelector('ion-tab-bar').style.display = 'none';
    }
  }
  ionViewDidLeave() {
    if (this.platform.is('mobile')) {
      window.document.querySelector('ion-tab-bar').style.display = 'inline-flex';
    }
  }

  ngOnInit() {
    window.dispatchEvent(new Event('resize'));

    this.watch = this.geolocation.watchPosition();
  }

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    if (!this.elevation_controll) {
      return;
    }
    // todo
    // resizeしたあと1秒以上固定だったら標高グラフを削除して再描画
  }

  ionViewWillEnter() {
    let center: any = [35.681, 139.767];
    this.map = L.map(this.map_elem.nativeElement, { center: center, zoom: 9, zoomControl: false });
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
    this.elevation_controll = L.control.elevation({
      position: 'bottomright',
      theme: 'steelblue-theme',
      // TODO : ウィンドウサイズ変更イベントに対応する
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
    this.elevation_controll.addTo(this.map);

    const id = this.route.snapshot.paramMap.get('id');
    var that = this;
    this.get(id).then(function (route: any) {
      // タイトル変更
      that.title = route.title;
      that.route_data.title = that.title;
      that.route_data.author = route.author;
      that.route_data.body = route.body;

      // 線を引く
      let pos = route.pos.split(',').map(p => { return p.split(' ') });
      that.route_data.pos = pos;

      // 標高も足しておく
      let level = route.level.split(',');
      that.route_data.ele = level;
      for (var i = 0; i < level.length; i++) {
        pos[i].push(level[i] * 1);
      }

      that.route_geojson.features[0].geometry.coordinates = pos;
      L.geoJSON(that.route_geojson, {
        "color": "#0000ff",
        "width": 6,
        "opacity": 0.7,
        onEachFeature: that.elevation_controll.addData.bind(that.elevation_controll)
      }).addTo(that.map);

      // icon 追加
      var startIcon = new L.icon({
        iconUrl: '/assets/icon/start_icon.png',
        iconSize: [50, 27], // size of the icon
        iconAnchor: [52, 27], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor    
      });
      let start = L.marker([pos[0][1], pos[0][0]], { icon: startIcon }).addTo(that.map);
      let goalIcon = new L.icon({
        iconUrl: '/assets/icon/goal_icon.png',
        iconSize: [50, 27], // size of the icon
        iconAnchor: [-2, 27], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor    
      });
      let goal = L.marker([pos[pos.length - 1][1], pos[pos.length - 1][0]], { icon: goalIcon }).addTo(that.map);
      let commentIcon = new L.icon({
        iconUrl: '/assets/icon/comment_icon.png',
        iconSize: [20, 20], // size of the icon
        iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor    
      });
      let editIcon = new L.icon({
        iconUrl: '/assets/icon/edit_icon.png',
        iconSize: [14, 14], // size of the icon
        iconAnchor: [7, 7], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor    
        className: 'map-editIcon',
      });

      for (let i = 0; i < route.kind.length; i++) {
        if (i === 0 || i === route.kind.length - 1) {
          // start, goalは除外
          continue;
        }
        if (route.kind[i] === '1') {
          let j = i / 2;
          if (pos[j]) {
            let edit = L.marker([pos[j][1], pos[j][0]], { icon: editIcon }).addTo(that.map);
          } else {
            console.log(j, pos.length);
          }
        }
      }
      let note = JSON.parse(route.note);
      if (note && note.length > 0) {
        for (let i = 0; i < note.length; i++) {
          let j = note[i].pos;
          let edit = L.marker([pos[j][1], pos[j][0]], { icon: commentIcon }).addTo(that.map);
        }
      }


      // 描画範囲をよろしくする
      let line = turf.lineString(pos);
      let bbox = turfbbox(line); // lonlat問題...
      that.map.fitBounds([ // いい感じの範囲にするために調整
        [bbox[1] * 1 - 0.05, bbox[0] * 1 - 0.05],
        [bbox[3] * 1 + 0.05, bbox[2] * 1 + 0.05]
      ]);
    });
  }


  toggleLocation() {
    let watch_button_dom = document.getElementsByClassName('watch-location')[0];

    // 無効化
    if (this.watch_location_subscribe && this.watch_location_subscribe.isStopped !== true) {
      console.log('watch stop gps');
      watch_button_dom.classList.remove('_active');
      this.watch_location_subscribe.unsubscribe();
      if (this.currenPossitionMarker) {
        this.map.removeLayer(this.currenPossitionMarker);
        this.currenPossitionMarker = null;
      }
      return;
    }

    // 有効化
    console.log('watch start gps');
    watch_button_dom.classList.add('_active');
    this.watch_location_subscribe = this.watch.subscribe((pos) => {
      this.watch.subscribe((pos) => {
        if (this.watch_location_subscribe.isStopped === true) {
          return;
        }
        let latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);

        if (!this.currenPossitionMarker) {
          let gpsIcon = new L.icon({
            iconUrl: '/assets/icon/gps_icon.png',
            iconSize: [20, 20], // size of the icon
            iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
            popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor    
          });
          this.currenPossitionMarker = new L.marker(latlng, { icon: gpsIcon }).addTo(this.map);
        } else {
          this.currenPossitionMarker.setLatLng(latlng);
        }

        this.map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
      });
    });
  }


  get(id): Promise<any[]> {
    let geturl = 'https://dev-api.routelabo.com/route/1.0.0/route';
    return this.http.get(geturl + '?id=' + id).toPromise()
      .then((res: any) => {
        if (!res.results) {
          return;
        }
        return res.results;
      });
  }


  async presentRouteInfoPage() {
    const modal = await this.modalCtrl.create({
      component: RouteinfoPage,
      componentProps: {}
    });
    return await modal.present();
  }

  public back() {
    this.navCtrl.navigateBack("/list");
  }

  async presentRouteExportPage() {
    const modal = await this.modalCtrl.create({
      component: ExportPage,
      componentProps: { route: this.route_data }
    });
    return await modal.present();
  }
}