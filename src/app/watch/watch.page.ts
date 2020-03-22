/* eslint-disable no-unused-vars */
import {
  Component, OnInit, ViewChild, ElementRef,
} from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
import {
  ModalController, NavController, ToastController, Platform, LoadingController,
} from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';
import { Storage } from '@ionic/storage';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { RouteinfoPage } from '../routeinfo/routeinfo.page';
import { ExportPage } from '../export/export.page';
import { LayerselectPage } from '../layerselect/layerselect.page';

import Routemap from './routemap';
import { RouteHubUser } from '../model/routehubuser';
import { RouteModel } from '../model/routemodel';
import 'firebase/auth';
import { getRouteQuery } from '../gql/RouteQuery';
import * as mapboxgl from 'mapbox-gl';
import chartjs_utils_elevation from 'chartjs-util-elevation';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-watch',
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.scss'],
})

export class WatchPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    private storage: Storage,
    public toastController: ToastController,
    private apollo: Apollo,
  ) {
    this.routemap = new Routemap();
  }
  @ViewChild('map', { static: true }) map_elem: ElementRef;
  @ViewChild('elevation', { static: true }) elev_elem: ElementRef;

  loading = null;

  user: RouteHubUser;

  route_data: RouteModel;

  title = '';

  author = '';

  noteData = [];

  id: string;

  map: any;
  // map: mapboxgl.Map;

  watch_location_subscribe: any;

  watch: any;

  currenPossitionMarker: any;

  isWatchLocation = false;

  elevation: any;

  route_geojson = {
    type: 'geojson',
    lineMetrics: true,
    data:
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    },
  };

  private line: any;

  favoriteIcon = 'star-outline';

  isFavorite = false;

  private animatedMarker: any;

  isPlaying: boolean;

  private hotlineLayer: any;

  private isSlopeMode = false;

  private editMarkers: Array<any> = [];


  routemap: Routemap;

  _routemap: any;

  private playSpeedIndex = 0;

  ionViewWillLeave() {
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
    window.document.title = 'ルートを見る RouteHub(β)';


    // ログイン
    const that = this;
    this.storage.get('user').then((json) => {
      if (!json || json === '') {
        return;
      }
      that.user = JSON.parse(json);
    });
  }

  // @HostListener('window:resize', ['$event'])
  // sizeChange(event) {
  //   if (!this.elevation) {

  //   }
  //   // todo
  //   // resizeしたあと1秒以上固定だったら標高グラフを削除して再描画
  // }

  ionViewWillEnter() {
    this.presentLoading();

    const routemap = this._routemap = this.routemap.createMap(this.map_elem.nativeElement);
    this.map = routemap.map;
    //this.elevation = routemap.elevation;


    this.id = this.route.snapshot.paramMap.get('id');
    //    this.route_data.id = id;

    const that = this;

    this.apollo.query({
      query: getRouteQuery(),
      variables: { ids: [this.id] },
    }).subscribe(({ data }) => {
      this.dissmissLoading();

      const _route: any = data;
      const route = Object.assign(_route.getPublicRoutes[0], _route.publicSearch[0]);

      that.route_data = new RouteModel();
      that.route_data.setFullData(route);
      console.log(that.route_data);

      // お気に入りの更新
      this.updateFavorite();

      // タイトル変更
      that.title = that.route_data.title;
      window.document.title = `${that.route_data.title} RouteHub(β)`;
      that.author = that.route_data.author;

      // 標高グラフ用のデータ作成
      const { pos } = that.route_data;
      for (let i = 0; i < that.route_data.level.length; i++) {
        pos[i].push(that.route_data.level[i] * 1);
      }
      that.route_geojson.data.geometry.coordinates = pos;
      // レイヤー追加
      console.log(that.route_geojson);

      const map = that.map as mapboxgl.Map;


      const getColor = (x) => {
        return x < 20 ? 'blue' :
          x < 40 ? 'royalblue' :
            x < 60 ? 'cyan' :
              x < 80 ? 'lime' :
                x < 100 ? 'red' :
                  'blue';
      };

      const func = (coordinates: Array<Array<number>>) => {
        const length = coordinates.length;
        const color = [];
        coordinates.forEach((c, i) => {
          const v = i / length;
          color.push(v);
          color.push(getColor(c[2]));
        });

        console.log(color);

        return [
          'interpolate',
          ['linear'],
          ['line-progress'],
          ...color
        ];
      };



      // const deduped = that.route_geojson.data.geometry.coordinates.map(p => {
      //   console.log(p);
      //   // return getColor(p[2]);
      //   return 0.3;
      // });


      // const func = () => {
      //   return gradient;
      // };


      // const gradient = Array.prototype.concat.apply([
      //   'interpolate',
      //   ['linear'],
      //   ['line-progress'],
      // ], deduped);



      map.on('load', () => {
        if (map.getLayer('route') !== undefined) {
          map.removeSource('route');
          map.removeLayer('route');
        }
        that.map.addSource('route', that.route_geojson);
        that.map.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#0000ff',
            'line-width': 6,
            'line-opacity': 0.7,
            'line-gradient': func(that.route_geojson.data.geometry.coordinates)
            // 'line-gradient': [
            //   'interpolate',
            //   ['linear'],
            //   ['line-progress'],
            //   0, "blue",
            //   0.1, "royalblue",
            //   0.3, "cyan",
            //   0.5, "lime",
            //   0.7, "yellow",
            //   1, "red"
            // ]
          }
        });

        const startEl = document.createElement('div');
        startEl.className = 'marker-start';
        startEl.style.backgroundImage = `url(${that.routemap.startIcon.iconUrl})`;
        startEl.style.backgroundSize = 'cover';
        startEl.style.width = that.routemap.startIcon.iconSize[0] + 'px';
        startEl.style.height = that.routemap.startIcon.iconSize[1] + 'px';
        new mapboxgl.Marker(startEl, { anchor: 'bottom-right' })
          .setLngLat([pos[0][0], pos[0][1]])
          // .setOffset([-that.routemap.startIcon.iconAnchor[0], -that.routemap.startIcon.iconAnchor[1]])
          .addTo(that.map);

        const goalEl = document.createElement('div');
        goalEl.className = 'marker-goal';
        goalEl.style.backgroundImage = `url(${that.routemap.goalIcon.iconUrl})`;
        goalEl.style.backgroundSize = 'cover';
        goalEl.style.width = that.routemap.goalIcon.iconSize[0] + 'px';
        goalEl.style.height = that.routemap.goalIcon.iconSize[1] + 'px';
        new mapboxgl.Marker(goalEl, { anchor: 'bottom-left' })
          .setLngLat([pos[pos.length - 1][0], pos[pos.length - 1][1]])
          .addTo(that.map);

        // 描画範囲をよろしくする
        that.map.fitBounds(that.routemap.posToLatLngBounds(pos));

        // 標高グラフ表示
        console.dir(that.route_data);
        let elevation = chartjs_utils_elevation(this.elev_elem.nativeElement, that.route_data.pos, {});
        console.dir(elevation);

      });
      // L.geoJson(that.route_geojson, {
      //   color: '#0000ff',
      //   width: 6,
      //   opacity: 0.7,
      //   onEachFeature: that.elevation.addData.bind(that.elevation),
      // }).addTo(that.map);

      const kind_list = [];
      for (let i = 0; i < route.kind.length; i++) {
        if (i === 0 || i === route.kind.length - 1) {
          // start, goalは除外
          continue;
        }
        if (route.kind[i] === '1') {
          const j = i / 2;
          if (pos[j]) {
            //            let edit = L.marker([pos[j][1], pos[j][0]], { icon: that.routemap.editIcon }).addTo(that.map);
            const kind_latlng = [pos[j][1], pos[j][0]];
            that.editMarkers.push(
              L.marker(kind_latlng, { icon: that.routemap.editIcon }),
            );
            kind_list.push(kind_latlng);
          } else {
            //            console.log(j, pos.length);
          }
        }
      }

      const note = JSON.parse(route.note);
      if (note && note.length > 0) {
        for (let i = 0; i < note.length; i++) {
          const noted_editablepos = note[i].pos * 1 - 1; // 配列的なアレで1つ減算
          if (!kind_list[noted_editablepos]) {
            continue;
          }
          that.noteData.push(
            {
              pos: kind_list[noted_editablepos],
              cmt: note[i].img ? note[i].img.replace('\n', '<br>') : '',
            },
          );
          const editmarker = L.marker(kind_list[noted_editablepos], { icon: that.routemap.commentIcon }).addTo(that.map);
          const comment = note[i].img ? note[i].img.replace('\n', '<br>') : ''; // APIのJSONにいれるやりかた間違えてるね
          editmarker.bindPopup(comment);
        }
      }


      // 再生モジュール追加
      //that.animatedMarker = that._routemap.addAnimatedMarker(pos);

      that.line = pos;
    });

    // UIの調整
    if (this.platform.is('mobile')) {
      window.document.querySelector('ion-tab-bar').style.display = 'none';
    }
  }

  updateFavorite() {
    if (!this.route_data.id || !this.user || !this.user.uid) {
      return;
    }

    // お気に入りの反映
    const graphquery = gql`query GetLikeSesrch($ids: [String!]!) {
    getLikeSesrch(search: { ids: $ids }) {
      id
    }
    }`;
    this.apollo.query({
      query: graphquery,
      variables: {
        ids: [this.route_data.id],
      },
    }).subscribe(({ data }) => {
      const _route: any = data;
      if (_route.getLikeSesrch.length > 0) {
        this.isFavorite = true;
        this.favoriteIcon = 'star';
      }
    });
  }


  toggleFavorite() {
    if (!this.user) {
      window.alert('ログイン・ユーザー登録をしてください');
      return;
    }

    if (!this.isFavorite) {
      // いいね登録する
      const graphquery = gql`mutation LikeRoute($ids: [String!]!) {
        likeRoute(ids: $ids) { 
          id
        } 
      }`;
      this.apollo.mutate({
        mutation: graphquery,
        variables: { ids: [this.route_data.id] },
      }).subscribe(() => {
        this.isFavorite = true;
        this.favoriteIcon = 'star';
      });
    } else {
      // いいねを削除する
      const graphquery = gql`mutation UnLikeRoute($ids: [String!]!) {
        unLikeRoute(ids: $ids) { 
          id
        } 
      }`;
      this.apollo.mutate({
        mutation: graphquery,
        variables: { ids: [this.route_data.id] },
      }).subscribe(() => {
        this.isFavorite = true;
        this.favoriteIcon = 'star-outline';
      });
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
    this.watch_location_subscribe = this.watch.subscribe(() => {
      this.watch.subscribe((pos) => {
        if (this.watch_location_subscribe.isStopped === true) {
          return;
        }
        const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);

        if (!this.currenPossitionMarker) {
          this.currenPossitionMarker = new L.marker(latlng, { icon: this.routemap.gpsIcon }).addTo(this.map);
          this.map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true }); // 初回のみ移動
        } else {
          this.currenPossitionMarker.setLatLng(latlng);
        }
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

  edit(event) {
    event.stopPropagation();
    // 状態の管理ができないのでアプリケーションの初期化をする
    // this.navCtrl.navigateForward('/edit/' + this.id);
    window.document.location.href = `/edit/${this.id}`;
  }

  fastPlay(event) {
    event.stopPropagation();
    if (!this.isPlaying) {
      // 動いていないときには再生をする
      this.animatedMarker.start();
      this.isPlaying = true;
      return;
    }
    const intervalTable = [
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
    const speed = intervalTable[this.playSpeedIndex];
    this.presentToast(`現在${speed[1]}で走行中`);
    this.animatedMarker.setInterval(speed[0]);
  }

  back() {
    if (window.history.length >= 1) {
      this.navCtrl.navigateForward('/');
    } else {
      this.navCtrl.back();
    }
  }

  moveAuthorList() {
    this.navCtrl.navigateForward(`/?mode=author&query=${this.route_data.author}`);
  }

  async presentRouteInfoPage(event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: RouteinfoPage,
      componentProps: { route: this.route_data },
    });
    return await modal.present();
  }

  async presentRouteExportPage(event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: ExportPage,
      componentProps: { route: this.route_data, noteData: this.noteData },
    });
    return await modal.present();
  }

  async presentLayerSelect(event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: LayerselectPage,
      componentProps: { route: this.route_data },
    });
    return await modal.present();
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'primary',
    });
    toast.present();
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'loading',
      duration: 3000,
    });
    // ローディング画面を表示
    await this.loading.present();
  }

  async dissmissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }
}
