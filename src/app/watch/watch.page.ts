import {
  Component, OnInit, ViewChild, ElementRef,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  ModalController, NavController, ToastController, Platform, LoadingController,
} from '@ionic/angular'
import { Geolocation } from '@ionic-native/geolocation/ngx'
import * as L from 'leaflet'
import * as firebase from 'firebase/app'
import gql from 'graphql-tag'
import { Apollo } from 'apollo-angular'
import { RouteinfoPage } from '../routeinfo/routeinfo.page'
import { ExportPage } from '../export/export.page'
import { LayerselectPage } from '../layerselect/layerselect.page'

import { Routemap } from './routemap'
import { RouteModel } from '../model/routemodel'
import 'firebase/auth'
import { getRouteQuery } from '../gql/RouteQuery'
import { AuthService } from '../auth.service'


@Component({
  selector: 'app-watch',
  templateUrl: './watch.page.html',
  styleUrls: ['./watch.page.scss'],
})

export class WatchPage implements OnInit {
  @ViewChild('map', { static: true }) mapElem: ElementRef;

  loading = null

  user: firebase.User

  routeData: RouteModel;

  title = '';

  author = '';

  noteData = [];

  id: string;

  map: any;

  watchLocationSubscribe: any;

  watch: any;

  currenPossitionMarker: any;

  isWatchLocation = false;

  elevation: any;

  routeGeojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [],
        },
      },
    ],
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#0000ff',
      'line-width': 6,
      'line-opacity': 0.7,
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

  createdRoutemap: any;

  constructor(
    private route: ActivatedRoute,
    private geolocation: Geolocation,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    public toastController: ToastController,
    private apollo: Apollo,
    private authService: AuthService,
  ) {
    this.routemap = new Routemap()
  }

  ionViewWillLeave() {
    if (this.platform.is('mobile')) {
      window.document.querySelector('ion-tab-bar').style.display = 'inline-flex'
    }

    if (this.hotlineLayer) {
      this.map.removeLayer(this.hotlineLayer)
      this.hotlineLayer = null
    }
  }

  ngOnInit() {
    window.dispatchEvent(new Event('resize'))
    this.watch = this.geolocation.watchPosition()
    window.document.title = 'ルートを見る RouteHub(β)'
  }

  ionViewWillEnter() {
    // ログインユーザーを取得
    this.user = this.authService.currentLoginUser

    this.presentLoading()

    const routemap = this.createdRoutemap = this.routemap.createMap(this.mapElem.nativeElement)
    this.map = routemap.map
    this.elevation = routemap.elevation

    this.id = this.route.snapshot.paramMap.get('id')

    const that = this

    this.apollo.query({
      query: getRouteQuery(),
      variables: { ids: [this.id] },
    }).subscribe(({ data }) => {
      this.dissmissLoading()

      const routeData: any = data
      const route = Object.assign(routeData.getPublicRoutes[0], routeData.publicSearch[0])

      that.routeData = new RouteModel()
      that.routeData.setFullData(route)

      // お気に入りの更新
      this.updateFavorite()

      // タイトル変更
      that.title = that.routeData.title
      window.document.title = `${that.routeData.title} RouteHub(β)`
      that.author = that.routeData.author

      // 標高グラフ用のデータ作成
      const { pos } = that.routeData
      for (let i = 0; i < that.routeData.level.length; i++) {
        pos[i].push(that.routeData.level[i] * 1)
      }
      that.routeGeojson.features[0].geometry.coordinates = pos
      L.geoJson(that.routeGeojson, {
        color: '#0000ff',
        width: 6,
        opacity: 0.7,
        onEachFeature: that.elevation.addData.bind(that.elevation),
      }).addTo(that.map)
      /*
      const start = L.marker([pos[0][1], pos[0][0]],
        { icon: that.routemap.startIcon }).addTo(that.map)
      const goal = L.marker([pos[pos.length - 1][1], pos[pos.length - 1][0]],
         { icon: that.routemap.goalIcon })
        .addTo(that.map)
      */
      const kindList = []
      for (let i = 0; i < route.kind.length; i++) {
        if (i === 0 || i === route.kind.length - 1) {
          // start, goalは除外
          continue
        }
        if (route.kind[i] === '1') {
          const j = i / 2
          if (pos[j]) {
            // let edit = L.marker([pos[j][1], pos[j][0]], { icon: that.routemap.editIcon })
            //   .addTo(that.map);
            const kindLatlng = [pos[j][1], pos[j][0]]
            that.editMarkers.push(
              L.marker(kindLatlng, { icon: that.routemap.editIcon }),
            )
            kindList.push(kindLatlng)
          } else {
            // console.log(j, pos.length);
          }
        }
      }

      const note = JSON.parse(route.note)
      if (note && note.length > 0) {
        for (let i = 0; i < note.length; i++) {
          const notedEditablepos = note[i].pos * 1 - 1 // 配列的なアレで1つ減算
          if (!kindList[notedEditablepos]) {
            continue
          }
          that.noteData.push(
            {
              pos: kindList[notedEditablepos],
              cmt: note[i].img ? note[i].img.replace('\n', '<br>') : '',
            },
          )
          const editmarker = L.marker(
            kindList[notedEditablepos], { icon: that.routemap.commentIcon },
          ).addTo(that.map)
          // APIのJSONにいれるやりかた間違えてるね
          const comment = note[i].img ? note[i].img.replace('\n', '<br>') : ''
          editmarker.bindPopup(comment)
        }
      }

      // 描画範囲をよろしくする
      that.map.fitBounds(that.routemap.posToLatLngBounds(pos))

      // 再生モジュール追加
      that.animatedMarker = that.createdRoutemap.addAnimatedMarker(pos)

      that.line = pos
    })

    // UIの調整
    if (this.platform.is('mobile')) {
      window.document.querySelector('ion-tab-bar').style.display = 'none'
    }
  }

  updateFavorite() {
    if (!this.routeData.id || !this.user) {
      return
    }

    // お気に入りの反映
    const graphquery = gql`query GetLikeSesrch($ids: [String!]!) {
    getLikeSesrch(search: { ids: $ids }) {
      id
    }
    }`
    this.apollo.query({
      query: graphquery,
      variables: {
        ids: [this.routeData.id],
      },
    }).subscribe(({ data }) => {
      const routeData: any = data
      if (routeData.getLikeSesrch.length > 0) {
        this.isFavorite = true
        this.favoriteIcon = 'star'
      }
    })
  }


  toggleFavorite() {
    if (!this.user) {
      window.alert('ログイン・ユーザー登録をしてください') // eslint-disable-line
      return
    }

    if (!this.isFavorite) {
      // いいね登録する
      const graphquery = gql`mutation LikeRoute($ids: [String!]!) {
        likeRoute(ids: $ids) { 
          id
        } 
      }`
      this.apollo.mutate({
        mutation: graphquery,
        variables: { ids: [this.routeData.id] },
      }).subscribe(({ data }) => { // eslint-disable-line
        this.isFavorite = true
        this.favoriteIcon = 'star'
      })
    } else {
      // いいねを削除する
      const graphquery = gql`mutation UnLikeRoute($ids: [String!]!) {
        unLikeRoute(ids: $ids) { 
          id
        } 
      }`
      this.apollo.mutate({
        mutation: graphquery,
        variables: { ids: [this.routeData.id] },
      }).subscribe(({ data }) => { // eslint-disable-line
        this.isFavorite = false
        this.favoriteIcon = 'star-outline'
      })
    }
  }

  toggleSlopeLayer(event) {
    event.stopPropagation()
    if (!this.hotlineLayer && !this.isSlopeMode) {
      this.hotlineLayer = this.createdRoutemap.addElevationHotlineLayer(this.line)
      this.presentToast('標高グラデーションモードに変更')
    } else if (this.hotlineLayer && !this.isSlopeMode) {
      this.map.removeLayer(this.hotlineLayer)
      this.hotlineLayer = this.createdRoutemap.addSlopeHotlineLayer(this.line)
      this.presentToast('斜度グラデーションモードに変更')
      this.isSlopeMode = true
    } else {
      this.map.removeLayer(this.hotlineLayer)
      this.hotlineLayer = false
      this.isSlopeMode = false
    }
  }

  toggleLocation(event) {
    event.stopPropagation()
    // 無効化
    if (this.watchLocationSubscribe && this.watchLocationSubscribe.isStopped !== true) {
      this.presentToast('GPS off')

      this.watchLocationSubscribe.unsubscribe()
      this.isWatchLocation = false
      if (this.currenPossitionMarker) {
        this.map.removeLayer(this.currenPossitionMarker)
        this.currenPossitionMarker = null
      }
      return
    }

    // 有効化
    this.presentToast('GPS on')
    this.isWatchLocation = true
    this.watchLocationSubscribe = this.watch.subscribe((pos) => { // eslint-disable-line
      this.watch.subscribe((gpsPos) => {
        if (this.watchLocationSubscribe.isStopped === true) {
          return
        }
        const latlng = new L.LatLng(gpsPos.coords.latitude, gpsPos.coords.longitude)

        if (!this.currenPossitionMarker) {
          this.currenPossitionMarker = new L.marker(
            latlng, { icon: this.routemap.gpsIcon },
          ).addTo(this.map)
          const latlon = [gpsPos.coords.latitude, gpsPos.coords.longitude]
          this.map.setView(latlon, 15, { animate: true }) // 初回のみ移動
        } else {
          this.currenPossitionMarker.setLatLng(latlng)
        }
      })
    })
  }

  togglePlay(event) {
    event.stopPropagation()
    if (this.isPlaying) {
      this.animatedMarker.stop()
      this.isPlaying = false
    } else {
      this.animatedMarker.start()
      this.isPlaying = true
    }
  }

  edit(event) {
    event.stopPropagation()
    // 状態の管理ができないのでアプリケーションの初期化をする
    // this.navCtrl.navigateForward('/edit/' + this.id);
    window.document.location.href = `/edit/${this.id}`
  }

  private playSpeedIndex = 0;

  fastPlay(event) {
    event.stopPropagation()
    if (!this.isPlaying) {
      // 動いていないときには再生をする
      this.animatedMarker.start()
      this.isPlaying = true
      return
    }
    const intervalTable = [
      [500, '約30km/h'],
      [250, '約80km/h'],
      [100, '約120km/h'],
      [30, '約500km/h'],
    ]
    if (intervalTable.length - 1 === this.playSpeedIndex) {
      this.playSpeedIndex = 0
    } else {
      this.playSpeedIndex++
    }
    const speed = intervalTable[this.playSpeedIndex]
    this.presentToast(`現在${speed[1]}で走行中`)
    this.animatedMarker.setInterval(speed[0])
  }

  back() {
    if (window.history.length >= 1) {
      this.navCtrl.navigateForward('/')
    } else {
      this.navCtrl.back()
    }
  }

  moveAuthorList() {
    this.navCtrl.navigateForward(`/?mode=author&query=${this.routeData.author}`)
  }

  async presentRouteInfoPage(event) {
    event.stopPropagation()
    const modal = await this.modalCtrl.create({
      component: RouteinfoPage,
      componentProps: { route: this.routeData },
    })
    return await modal.present()
  }

  async presentRouteExportPage(event) {
    event.stopPropagation()
    const modal = await this.modalCtrl.create({
      component: ExportPage,
      componentProps: { route: this.routeData, noteData: this.noteData },
    })
    return await modal.present()
  }

  async presentLayerSelect(event) {
    event.stopPropagation()
    const modal = await this.modalCtrl.create({
      component: LayerselectPage,
      componentProps: { route: this.routeData },
    })
    return await modal.present()
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'primary',
    })
    toast.present()
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'loading',
      duration: 3000,
    })
    // ローディング画面を表示
    await this.loading.present()
  }

  async dissmissLoading() {
    if (this.loading) {
      await this.loading.dismiss()
    }
  }
}
