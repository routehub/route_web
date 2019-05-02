import { async } from '@angular/core/testing';
import { LoginPage } from './../login/login.page';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';
import turfbbox from '@turf/bbox';
import * as turf from '@turf/helpers';
import { RouteinfoPage } from '../routeinfo/routeinfo.page';
import { ExportPage } from '../export/export.page';
import { Platform } from '@ionic/angular';
import { Routemap, Route } from './routemap';
import * as Elevation from 'leaflet.elevation/src/L.Control.Elevation.js';

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
  elevation: any;
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

  routemap: Routemap;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public platform: Platform,
  ) {
    console.dir(Elevation); // アクセスすることによって、変数展開してる...
    this.routemap = new Routemap();
  }

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
    if (!this.elevation) {
      return;
    }
    // todo
    // resizeしたあと1秒以上固定だったら標高グラフを削除して再描画
  }

  ionViewWillEnter() {
    let routemap = this.routemap.createMap(this.map_elem.nativeElement);
    this.map = routemap.map;
    this.elevation = routemap.elevation;

    const id = this.route.snapshot.paramMap.get('id');

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
      componentProps: { route: this.route_data }
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


  /***
   * GPSボタンのトグル
   */
  toggleLocation() {
    let watch_button_dom = document.getElementsByClassName('watch-location')[0];

    // 無効化
    if (this.watch_location_subscribe && this.watch_location_subscribe.isStopped !== true) {
      watch_button_dom.classList.remove('_active');
      this.watch_location_subscribe.unsubscribe();
      if (this.currenPossitionMarker) {
        this.map.removeLayer(this.currenPossitionMarker);
        this.currenPossitionMarker = null;
      }
      return;
    }

    // 有効化
    watch_button_dom.classList.add('_active');
    this.watch_location_subscribe = this.watch.subscribe((pos) => {
      this.watch.subscribe((pos) => {
        if (this.watch_location_subscribe.isStopped === true) {
          return;
        }
        let latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);

        if (!this.currenPossitionMarker) {
          this.currenPossitionMarker = new L.marker(latlng, { icon: this.routemap.gpsIcon }).addTo(this.map);
        } else {
          this.currenPossitionMarker.setLatLng(latlng);
        }

        this.map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
      });
    });
  }
}