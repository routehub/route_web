import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';
import turfbbox from '@turf/bbox';
import * as turf from '@turf/helpers';
import { RouteinfoPage } from '../routeinfo/routeinfo.page';
import { ExportPage } from '../export/export.page';
import { LayerselectPage } from '../layerselect/layerselect.page';
import { Platform } from '@ionic/angular';
import { Routemap } from './routemap';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';
import { RouteHubUser } from './../model/routehubuser';
import { RouteModel } from '../model/routemodel';
import * as firebase from 'firebase/app';
import 'firebase/auth';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.scss'],
})

export class WatchPage implements OnInit {
  @ViewChild('map') map_elem: ElementRef;

  user: RouteHubUser;
  route_data: RouteModel;
  title = "";
  author = "";

  id: string;
  map: any;
  watch_location_subscribe: any;
  watch: any;
  currenPossitionMarker: any;
  isWatchLocation = false;
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
  private line: any;

  favoriteIcon = 'heart-empty';
  isFavorite = false;

  private animatedMarker: any;
  isPlaying: boolean;

  private hotlineLayer: any;
  private isSlopeMode = false;

  private editMarkers: Array<any> = [];



  routemap: Routemap;
  _routemap: any;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public platform: Platform,
    private storage: Storage,
    public toastController: ToastController
  ) {
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

    if (this.hotlineLayer) {
      this.map.removeLayer(this.hotlineLayer);
      this.hotlineLayer = null;
    }
  }

  ngOnInit() {
    window.dispatchEvent(new Event('resize'));
    this.watch = this.geolocation.watchPosition();
    window.document.title = 'ルートを見る RouteHub';


    // ログイン
    let that = this;
    this.storage.get('user').then((json) => {
      if (!json || json == "") {
        return;
      }
      that.user = JSON.parse(json);
    });
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
    let routemap = this._routemap = this.routemap.createMap(this.map_elem.nativeElement);
    this.map = routemap.map;
    this.elevation = routemap.elevation;

    this.id = this.route.snapshot.paramMap.get('id');
    //    this.route_data.id = id;

    var that = this;
    this.get(this.id).then(function (route: any) {
      that.route_data = new RouteModel();
      that.route_data.setFullData(route);

      // タイトル変更
      that.title = that.route_data.title;
      window.document.title = that.route_data.title + ' RouteHub';
      that.author = that.route_data.author;

      // 標高グラフ用のデータ作成
      let pos = that.route_data.pos;
      for (var i = 0; i < that.route_data.level.length; i++) {
        pos[i].push(that.route_data.level[i] * 1);
      }
      that.route_geojson.features[0].geometry.coordinates = pos;
      L.geoJson(that.route_geojson, {
        "color": "#0000ff",
        "width": 6,
        "opacity": 0.7,
        onEachFeature: that.elevation.addData.bind(that.elevation)
      }).addTo(that.map);

      let start = L.marker([pos[0][1], pos[0][0]], { icon: that.routemap.startIcon }).addTo(that.map);
      let goal = L.marker([pos[pos.length - 1][1], pos[pos.length - 1][0]], { icon: that.routemap.goalIcon }).addTo(that.map);

      let kind_list = [];
      for (let i = 0; i < route.kind.length; i++) {
        if (i === 0 || i === route.kind.length - 1) {
          // start, goalは除外
          continue;
        }
        if (route.kind[i] === '1') {
          let j = i / 2;
          if (pos[j]) {
            //            let edit = L.marker([pos[j][1], pos[j][0]], { icon: that.routemap.editIcon }).addTo(that.map);
            let kind_latlng = [pos[j][1], pos[j][0]];
            that.editMarkers.push(
              L.marker(kind_latlng, { icon: that.routemap.editIcon })
            );
            kind_list.push(kind_latlng);
          } else {
            //            console.log(j, pos.length);
          }
        }
      }

      let note = JSON.parse(route.note);
      if (note && note.length > 0) {
        for (let i = 0; i < note.length; i++) {
          let noted_editablepos = note[i].pos * 1 - 1; // 配列的なアレで1つ減算
          if (!kind_list[noted_editablepos]) {
            continue;
          }
          let editmarker = L.marker(kind_list[noted_editablepos], { icon: that.routemap.commentIcon }).addTo(that.map);
          var comment = note[i].img ? note[i].img.replace("\n", "<br>") : ''; // APIのJSONにいれるやりかた間違えてるね
          editmarker.bindPopup(comment);
        }
      }


      // 描画範囲をよろしくする
      let line = turf.lineString(pos);
      let bbox = turfbbox(line); // lonlat問題...
      const latplus = Math.abs(bbox[1] - bbox[3]) * 0.1;
      const lonplus = Math.abs(bbox[0] - bbox[2]) * 0.1;
      that.map.fitBounds([ // いい感じの範囲にするために調整
        [bbox[1] * 1 - latplus, bbox[0] * 1 - lonplus],
        [bbox[3] * 1 + latplus, bbox[2] * 1 + lonplus]
      ]);

      // 再生モジュール追加
      that.animatedMarker = routemap.addAnimatedMarker(pos);

      that.line = pos;
    });

    /**
     * いいねの取得
     */
    // ログインしているか確認
    if (!this.user && !this.id) {
      return;
    }
    // ログインしていたらデータを取得    
    let is_favorite = this.getFavoriteStatus(this.id).then((ret: any) => {
      if (!ret.results || ret.results.length === 0) {
        return;
      }
      this.isFavorite = true;
      this.favoriteIcon = 'heart';
    });

  }

  async getFavoriteStatus(id): Promise<any[]> {
    // TODO : ダサい実装よくない. eventとかのほうがまだいい
    if (!this.user || !this.user.token) {
      const sleep = (msec) => new Promise(resolve => setTimeout(resolve, msec));
      await sleep(1200);
      if (!this.user) {
        return;
      }
    }
    let url = environment.api.host + environment.api.like_path + '?id=' + id + '&firebase_id_token=' + this.user.token;
    return this.http.get(url).toPromise()
      .then((res: any) => {
        return res;
      });
  }

  toggleFavorite() {
    if (!this.user) {
      window.alert('ログイン・ユーザー登録をしてください');
    }

    if (!this.isFavorite) {
      // いいね登録する
      this.isFavorite = true;
      this.favoriteIcon = 'heart';
      // post
      const httpOptions = {
        headers: new HttpHeaders(
          'Content-Type:application/x-www-form-urlencoded'
        )
      };
      let url = environment.api.host + environment.api.like_path;
      this.http.post(url,
        'id=' + this.route_data.id + '&' + 'firebase_id_token=' + this.user.token,
        httpOptions).toPromise();
      /*{
      id: this.route_data.id,
      firebase_id_token: firebase_id_token
    }*/

    } else {
      // いいね削除する
      this.isFavorite = false;
      this.favoriteIcon = 'heart-empty';
      // delete
      let url = environment.api.host + environment.api.like_delete_path;
      // DBから削除
      const httpOptions = {
        headers: new HttpHeaders(
          'Content-Type:application/x-www-form-urlencoded'
        )
      };
      this.http.post(url,
        'firebase_id_token=' + this.user.token + '&' + 'id=' + this.route_data.id,
        httpOptions).toPromise();
    }

  }

  toggleSlopeLayer(event) {
    event.stopPropagation();
    if (!this.hotlineLayer && !this.isSlopeMode) {
      this.hotlineLayer = this._routemap.addElevationHotlineLayer(this.line);
      this.presentToast('標高グラデーションモードに変更');
    } else if (this.hotlineLayer && !this.isSlopeMode) {
      this.map.removeLayer(this.hotlineLayer);
      this.hotlineLayer = this._routemap.addSlopeHotlineLayer(this.line);
      this.presentToast('斜度グラデーションモードに変更');
      this.isSlopeMode = true;
    } else {
      this.map.removeLayer(this.hotlineLayer);
      this.hotlineLayer = false;
      this.isSlopeMode = false;
    }
  }

  toggleLocation(event) {
    event.stopPropagation();
    // 無効化
    if (this.watch_location_subscribe && this.watch_location_subscribe.isStopped !== true) {
      this.presentToast('GPS off');

      this.watch_location_subscribe.unsubscribe();
      this.isWatchLocation = false;
      if (this.currenPossitionMarker) {
        this.map.removeLayer(this.currenPossitionMarker);
        this.currenPossitionMarker = null;
      }
      return;
    }

    // 有効化
    this.presentToast('GPS on');
    this.isWatchLocation = true;
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

  togglePlay(event) {
    event.stopPropagation();
    if (this.isPlaying) {
      this.animatedMarker.stop();
      this.isPlaying = false;
    } else {
      this.animatedMarker.start();
      this.isPlaying = true;
    }
  }

  alretEditable(event) {
    event.stopPropagation();

    this.presentToast('編集モード・フォーク機能は鋭意開発中です＞＜ \nもうしばらくお待ち下さい')

    this.editMarkers.forEach(m => {
      m.addTo(this.map);
    });

    let removeIcon = () => {
      this.editMarkers.forEach(m => {
        this.map.removeLayer(m);
      });
    }
    setTimeout(removeIcon, 5000);
  }

  private playSpeedIndex = 0;
  fastPlay(event) {
    event.stopPropagation();
    if (!this.isPlaying) {
      // 動いていないときには再生をする
      this.animatedMarker.start();
      this.isPlaying = true;
      return;
    }
    let intervalTable = [
      [500, '約30km/h'],
      [250, '約80km/h'],
      [100, '約120km/h'],
      [30, '約500km/h'],
    ];
    if (intervalTable.length - 1 === this.playSpeedIndex) {
      this.playSpeedIndex = 0;
    } else {
      this.playSpeedIndex++;
    }
    let speed = intervalTable[this.playSpeedIndex];
    this.presentToast('現在' + speed[1] + 'で走行中');
    this.animatedMarker.setInterval(speed[0]);

  }


  get(id): Promise<any[]> {
    let geturl = environment.api.host + environment.api.route_path;
    return this.http.get(geturl + '?id=' + id).toPromise()
      .then((res: any) => {
        if (!res.results) {
          return;
        }
        return res.results;
      });
  }

  back() {
    this.navCtrl.back();
  }
  moveAuthorList() {
    this.navCtrl.navigateForward('/list?mode=author&query=' + this.route_data.author);
  }

  async presentRouteInfoPage(event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: RouteinfoPage,
      componentProps: { route: this.route_data }
    });
    return await modal.present();
  }
  async presentRouteExportPage(event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: ExportPage,
      componentProps: { route: this.route_data }
    });
    return await modal.present();
  }
  async presentLayerSelect(event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: LayerselectPage,
      componentProps: { route: this.route_data }
    });
    return await modal.present();
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: "primary",
    });
    toast.present();
  }

}
