import { RouteModel } from '../model/routemodel'
import {
  Component, OnInit, ViewChild, ElementRef,
} from '@angular/core'
import {
  ToastController, Platform, ModalController, NavController, LoadingController,
} from '@ionic/angular'
import { HttpClient } from '@angular/common/http'
import * as L from 'leaflet'
import { Geolocation } from '@ionic-native/geolocation/ngx'
import * as firebase from 'firebase/app'
import * as Hammer from 'hammerjs'
import 'firebase/auth'
import { ActivatedRoute } from '@angular/router'
import { Apollo } from 'apollo-angular'
import gql from 'graphql-tag'
import polyline from '@mapbox/polyline'
import { Routemap } from '../watch/routemap'
import { environment } from '../../environments/environment'
import { LayerselectPage } from '../layerselect/layerselect.page'
import { getRouteQuery } from '../gql/RouteQuery'
import { AuthService } from '../auth.service'

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})

export class EditPage implements OnInit {
  @ViewChild('map', { static: true }) map_elem: ElementRef;

  @ViewChild('title', { static: true }) title_elem: ElementRef;

  @ViewChild('total_dist', { static: true }) total_dist_elem: ElementRef;

  @ViewChild('total_elev', { static: true }) total_elev_elem: ElementRef;

  @ViewChild('max_elev', { static: true }) max_elev_elem: ElementRef;

  @ViewChild('editbar', { static: true }) editbar_elem: ElementRef;

  @ViewChild('hidearea', { static: true }) hidearea_elem: ElementRef;

  @ViewChild('close_editbar', { static: true }) close_editbar_elem: ElementRef;

  loading = null;

  route_id: string = null;

  map: any;

  routemap: Routemap;

  elevation: any;

  editMode = false;

  editMarkers = [];

  tags = [];

  isNotPrivate = true;

  title = '';

  author = '';

  body = '';

  geojson: L.geoJSON;

  private hotlineLayer: any;

  private isSlopeMode = false;

  private line: any;

  private _routemap: any;

  canEdit = true;

  routingMode: number = 0;

  // https://valhalla.readthedocs.io/en/latest/api/turn-by-turn/api-reference/
  routingModeList: string[] = ['自転車(ロード),bicycle,Road', '自転車(グラベル),bicycle,Mountain', '車,auto,', '直線,Line,'];

  watch_location_subscribe: any;

  watch: any;

  currenPossitionMarker: any;

  isWatchLocation = false;

  routing_url = 'https://api2.routehub.app/route/1.0.0/routing'

  distance = 0.0;

  height_gain = 0.0;

  height_max = 0.0;

  route_geojson = {
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

  hammer: any;

  constructor(
    private http: HttpClient,
    public toastController: ToastController,
    public platform: Platform,
    public modalCtrl: ModalController,
    private geolocation: Geolocation,
    public navCtrl: NavController,
    private ngRoute: ActivatedRoute,
    public loadingCtrl: LoadingController,
    private apollo: Apollo,
    public authService: AuthService,
  ) {
    this.routemap = new Routemap()
    this.line = []
  }

  ngOnInit() {
    this.watch = this.geolocation.watchPosition()
  }

  ionViewWillEnter() {
    const that = this
    // ルートidが指定されているときは読み込み
    this.route_id = this.ngRoute.snapshot.paramMap.get('id')

    if (!this.route_id) {
      window.document.getElementById('share_link_row').style.display = 'none'
    } else {
      window.document.getElementById('share_link').innerText = `http://routehub.app/watch/${this.route_id}`
      window.document.getElementById('share_link').setAttribute('href', `http://routehub.app/watch/${this.route_id}`)

      this.load()
    }

    if (!this.map) {
      const routemap = this._routemap = this.routemap.createMap(this.map_elem.nativeElement)
      this.map = routemap.map
      L.control.zoom({ position: 'topleft' }).addTo(this.map)
      this.elevation = routemap.elevation
    }

    // デバッグ時にテンションを上げるためY!地図にする
    // let layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0];
    // layerControlElement.getElementsByTagName('input')[2].click();

    // 見やすくするために最初からメニューを開いておく
    document.getElementById('menuButton').click()

    this.hammer = new Hammer(this.map_elem.nativeElement)

    if (!this.editMode) {
      this._toggleCreateMode()
    }

    if (this.platform.is('mobile')) {
      window.document.querySelector('ion-tab-bar').style.display = 'none'
    }

    this.editbar_elem.nativeElement.addEventListener('touchstart', () => {
      this.hidearea_elem.nativeElement.style.display = 'block'
    })
    this.editbar_elem.nativeElement.onclick = () => {
      this.hidearea_elem.nativeElement.style.display = 'block'
    }

    const layerDom = window.document.querySelector('div.leaflet-control-container > div.leaflet-top.leaflet-right > div') as HTMLElement
    const Zoomctrl = window.document.querySelector('div.leaflet-control-container > div.leaflet-top.leaflet-left > div') as HTMLElement
    layerDom.style.top = '62px'
    Zoomctrl.style.top = '62px'


    // ファイルアップロード関連の処理
    const parse_gpx = (xml_string) => {
      const route = []
      const parser = new DOMParser()
      const xmldoc = parser.parseFromString(xml_string, 'text/xml')
      //        console.dir(xmldoc);
      that.title = xmldoc.querySelector('trk > name').textContent
      xmldoc.querySelectorAll('trk > trkseg > trkpt').forEach((pt) => {
        //          console.dir(pt);
        route.push([pt.attributes[1].value, pt.attributes[0].value, 0])
      })
      that.line = route
      that.refresh_geojson()
      that.map.fitBounds(that.routemap.posToLatLngBounds(route))
      //        return route;
    }

    const filedom = document.getElementById('file')
    filedom.addEventListener('change', (e) => {
      e.stopPropagation()
      e.preventDefault()
      const filename = (<HTMLInputElement>e.target).files[0]

      const reader = new FileReader()
      reader.onloadend = (loadEvent) => {
        parse_gpx((<FileReaderEventTarget>loadEvent.target).result)
      }
      reader.readAsText(filename)
    }, false)
  }

  ionViewWillLeave() {
    if (this.platform.is('mobile')) {
      window.document.querySelector('ion-tab-bar').style.display = 'inline-flex'
    }

    // リセット
    const that = this
    this.editMarkers.map((markerData) => {
      markerData.marker.removeFrom(that.map)
    })
    this.editMarkers = []
    this.line = []
    this.remove_geojson()
    this.elevation.clear()
    this.total_dist_elem.nativeElement.innerText = 0
    this.total_elev_elem.nativeElement.innerText = 0
    this.max_elev_elem.nativeElement.innerText = 0
  }

  closeEditbar(e) {
    e.stopPropagation()
    e.preventDefault()
    this.hidearea_elem.nativeElement.style.display = 'none'
  }

  toggleCreateMode(event) {
    event.stopPropagation()
    this._toggleCreateMode()
  }

  _toggleCreateMode() {
    const that = this

    this.editMode = !this.editMode

    if (this.editMode) {
      that.hammer.on('tap', (ev) => {
        if (!that.canEdit) {
          // 編集不可
          return
        }

        let header_height = 64
        if (that.platform.is('mobile')) {
          header_height = 10
        }
        const _point = L.point(ev.center.x, ev.center.y - header_height)
        const latlng = that.map.containerPointToLatLng(_point)

        const overlap_marker = that.find_nearest_marker_from_latlng(latlng, 16.0)
        if (overlap_marker != null) {
          // タップ位置にポイントが存在するので何もしない
          return
        }

        const marker_data = new MarkerData(that, latlng)

        // 経由点追加テスト
        const overlap_route = that.find_nearest_route_point_from_latlng(latlng, 16.0)
        if (overlap_route == null) {
          // タップ位置がルート上ではない
          that.push_marker(marker_data)
        } else {
          // タップ位置がルート上
          that.insert_marker(marker_data, overlap_route.next_data)
        }
      })


      this.presentToast('ルート編集モードに変更')
    } else {
      this.presentToast('ルート表示モードに変更')
      this.hammer.off('tap')
    }
  }

  // 指定したlatlngからa_distance以内で最寄りのMarkerDataを返す
  find_nearest_marker_from_latlng(a_latlng, a_distance: number) {
    const that = this
    const latlng_point = that.map.latLngToContainerPoint(a_latlng)
    const dist2 = a_distance * a_distance

    let res = null
    let min_dist = 0.0

    for (let i = 0; i < that.editMarkers.length; ++i) {
      const mark = that.editMarkers[i]
      const point = that.map.latLngToContainerPoint(mark.marker._latlng)

      const delta_x = point.x - latlng_point.x
      const delta_y = point.y - latlng_point.y

      const dist = delta_x * delta_x + delta_y * delta_y
      // console.log("dist: ", Math.sqrt( dist ) );

      if (dist > dist2) {
        continue
      }

      if ((res != null) && (dist >= min_dist)) {
        continue
      }

      res = mark
      min_dist = dist
    }

    return res
  }

  // 指定したlatlngからa_distance以内で最寄りのrouteポイントを含むMarkerDataを返す
  find_nearest_route_point_from_latlng(a_latlng, a_distance: number) {
    const that = this
    const latlng_point = that.map.latLngToContainerPoint(a_latlng)
    const dist2 = a_distance * a_distance

    let res = null
    let min_dist = 0.0

    for (let i = 0; i < that.editMarkers.length; ++i) {
      const mark = that.editMarkers[i]

      if (mark.bounds == null) {
        continue
      }

      if (!mark.bounds.contains(a_latlng)) {
        continue
      }

      const { route } = mark

      for (let j = 0; j < route.length; ++j) {
        // let point = that.map.latLngToContainerPoint( route[j] );
        const latlng = L.latLng(route[j][1], route[j][0])
        const point = that.map.latLngToContainerPoint(latlng)

        const delta_x = point.x - latlng_point.x
        const delta_y = point.y - latlng_point.y

        const dist = delta_x * delta_x + delta_y * delta_y
        // console.log("dist: ", Math.sqrt( dist ) );

        if (dist > dist2) {
          continue
        }

        if ((res != null) && (dist >= min_dist)) {
          continue
        }

        res = mark
        min_dist = dist
      }
    }

    return res
  }

  // geoJsonをmapから削除
  remove_geojson() {
    const that = this

    if (that.geojson != null) {
      that.geojson.removeFrom(that.map)
      that.geojson = null
    }
  }

  // geoJson更新
  refresh_geojson() {
    const that = this

    that.remove_geojson()

    if (that.line.length <= 0) {
      return
    }

    that.route_geojson.features[0].geometry.coordinates = that.line

    that.elevation.clear()

    // TODO : ルート系のレイヤーがあれば処理が面倒なので削除しているが、そのうちうまく更新したい
    if (this.hotlineLayer) {
      this.presentToast('グラデーションモードを解除')
      this.map.removeLayer(this.hotlineLayer)
      this.hotlineLayer = false
      this.isSlopeMode = false
    }
    that.geojson = L.geoJson(that.route_geojson, {
      color: '#0000ff',
      width: 6,
      opacity: 0.7,
      onEachFeature: that.elevation.addData.bind(that.elevation),
    })

    that.geojson.addTo(that.map)

    // that.geojson.features[0].geometry.on('click', function(e)
    // {
    //   console.log("on click geometry");
    // });
    // that.geojson.on('click', function(e)
    // {
    //   console.log("on click geojson");
    // });
  }

  // routeポイント全更新
  refresh_route() {
    const that = this

    that.line = []

    that.distance = 0.0
    that.height_gain = 0.0
    that.height_max = 0.0
    for (let i = 0; i < that.editMarkers.length - 1; ++i) {
      // console.log(that.editMarkers[i].route.length);
      that.line = that.line.concat(that.editMarkers[i].route)

      that.distance += that.editMarkers[i].distance
      that.height_gain += that.editMarkers[i].height_gain
      that.height_max = Math.max(that.height_max, that.editMarkers[i].height_max)
    }

    that.total_dist_elem.nativeElement.innerText = Math.round(that.distance * 10) / 10
    that.total_elev_elem.nativeElement.innerText = Math.round(that.height_gain * 10) / 10
    that.max_elev_elem.nativeElement.innerText = Math.round(that.height_max * 10) / 10


    that.refresh_geojson()
    that.refresh_all_marker_icon()
  }

  // MarkerDataを最後尾に追加
  push_marker(a_markar_data: MarkerData) {
    const that = this

    a_markar_data.marker.addTo(that.map)

    that.editMarkers.push(a_markar_data)

    if (that.editMarkers.length >= 2) {
      const start_data = that.editMarkers[that.editMarkers.length - 2]
      const goal_data = that.editMarkers[that.editMarkers.length - 1]

      start_data.set_next(goal_data)

      start_data.routing().then(() => {
        that.line = that.line.concat(start_data.route)
        that.distance += start_data.distance
        that.height_gain += start_data.height_gain
        that.height_max = Math.max(that.height_max, start_data.height_max)

        that.total_dist_elem.nativeElement.innerText = Math.round(that.distance * 10) / 10
        that.total_elev_elem.nativeElement.innerText = Math.round(that.height_gain * 10) / 10
        that.max_elev_elem.nativeElement.innerText = Math.round(that.height_max * 10) / 10

        that.refresh_geojson()
        that.refresh_all_marker_icon()
      })
    }
  }

  // MarkerDataを指定したa_positionの前に挿入
  insert_marker(a_markar_data: MarkerData, a_position: MarkerData) {
    const that = this

    a_markar_data.marker.addTo(that.map)

    for (let i = 0; i < that.editMarkers.length; ++i) {
      if (that.editMarkers[i] !== a_position) {
        continue
      }

      const prev = that.editMarkers[i].prev_data
      const next = that.editMarkers[i]

      const last = that.editMarkers.splice(i, that.editMarkers.length - i)
      that.editMarkers.push(a_markar_data)
      that.editMarkers = that.editMarkers.concat(last)

      a_markar_data.set_next(next)
      a_markar_data.set_prev(prev)

      a_markar_data.refresh_marker()
      break
    }
  }

  // MarkerData削除
  remove_markar(a_markar_data: MarkerData) {
    const that = this

    a_markar_data.marker.removeFrom(that.map)

    for (let n = 0; n < that.editMarkers.length; ++n) {
      if (that.editMarkers[n] !== a_markar_data) {
        continue
      }

      that.editMarkers.splice(n, 1)
      break
    }
  }

  // editMarkersを精査してiconを設定
  refresh_all_marker_icon() {
    for (let i = 0; i < this.editMarkers.length; ++i) {
      if (i === 0) {
        this.editMarkers[i].setIcon(this.routemap.startIcon)
      } else if (i === this.editMarkers.length - 1) {
        this.editMarkers[i].setIcon(this.routemap.goalIcon)
      } else {
        this.editMarkers[i].setIcon(this.routemap.editIcon)
      }
    }
  }

  // ルート検索API呼び出し
  async routing(pointList: string[]) {
    const costing_model = this.routingModeList[this.routingMode].split(',')[1]
    const bicycle_type = this.routingModeList[this.routingMode].split(',')[2]
    const url = `${this.routing_url}?costing_model=${costing_model}&bicycle_type=${bicycle_type}&points=${pointList.join(' ')}`;

    return await this.http.get(url).toPromise().then((res: any) => {
      const ret = []

      res.forEach((p: any) => {
        ret.push([p[1], p[0], p[2]])
      })
      return ret
    })
  }

  async load() {
    const that = this
    this.presentLoading()

    this.apollo.query({
      query: getRouteQuery(),
      variables: { ids: [this.route_id] },
      fetchPolicy: 'no-cache',
    }).subscribe(({ data }) => {
      this.dissmissLoading()

      const _route: any = data
      const _r = Object.assign(_route.getPublicRoutes[0], _route.publicSearch[0])

      that.editMarkers = []
      that.line = []
      that.remove_geojson()

      that.total_dist_elem.nativeElement.innerText = 0
      that.total_elev_elem.nativeElement.innerText = 0
      that.max_elev_elem.nativeElement.innerText = 0

      const r = new RouteModel()
      r.setFullData(_r)

      that.title = r.title
      that.author = r.display_name
      that.isNotPrivate = !r.is_private
      that.tags = r.tag
      that.body = r.body

      // TODO : max_slopeとかやる
      that.distance = r.total_dist
      that.height_gain = r.total_elevation
      that.height_max = r.max_elevation

      that.total_dist_elem.nativeElement.innerText = r.total_dist
      that.total_elev_elem.nativeElement.innerText = r.total_elevation
      that.max_elev_elem.nativeElement.innerText = r.max_elevation

      let previndex = 0
      let prev: MarkerData
      r.pos_latlng.map((p, i) => {
        // マーカーを設定
        if (r.kind[i] === '1') {
          const latlng = new L.LatLng(p[0], p[1])
          // console.log("marker index[" + i + "]: " + latlng);
          const marker = new MarkerData(that, latlng)
          marker.marker.addTo(that.map)
          that.editMarkers.push(marker)

          if (prev) {
            prev.set_next(marker)
            prev.route = r.pos.slice(previndex, i)
            // console.log( "route: " + prev.route );
            prev.refresh_information()
          }
          prev = marker
          previndex = i
        }
      })

      that.refresh_all_marker_icon()

      that.line = r.pos.map((p, i) => {
        p.push(r.level[i] * 1)
        return p
      })
      that.refresh_geojson()

      // 描画範囲をよろしくする
      that.map.fitBounds(that.routemap.posToLatLngBounds(r.pos))
    })
  }


  async save(event) {
    console.log('save')
    event.stopPropagation()

    // TODO ログインしていないときはローカルストレージに入れて一時保存させてあげたいなぁ
    if (!this.authService.currentLoginUser) {
      alert('ログインしてから作成してください')
      return
    }

    if (!this.line || this.line.length === 0) {
      alert('保存するルートがありません')
      return
    }

    if (this.title === '') {
      alert('タイトルを入力してください')
      return
    }

    if (this.author === '') {
      alert('ルートの作者名を入力してください')
      return
    }

    const getKind = () => {
      let ret = []
      for (let i = 0; i < this.editMarkers.length; i++) {
        const m = this.editMarkers[i]
        if (m.route.length > 0) {
          const tmp = new Array(m.route.length - 1).fill(0)
          tmp.push(1)
          ret = ret.concat(tmp)
        }
      }
      ret.shift()
      ret.unshift(1)
      return ret
    }

    const start_point_name = await this.getAddressName(this.line[0]).then((address) => address)
    const goal_point_name = await this.getAddressName(this.line[this.line.length - 1]).then((address) => address)

    const token = await this.authService.currentLoginUser.getIdToken()
    const route = {
      id: this.route_id || '',
      title: `${this.title.replace('\n', '')}`,
      body: this.body,
      author: this.author,
      tag: this.tags.map((t) => ((typeof t === 'object') ? t.value : t)).join(' '),
      total_dist: `${Math.round(this.distance * 10) / 10}`,
      total_elevation: `${Math.round(this.height_gain * 10) / 10}`,
      max_elevation: `${Math.round(this.height_max * 10) / 10}`,
      max_slope: '0.0', // TODO
      avg_slope: '0.0', // TODO
      start_point: start_point_name,
      goal_point: goal_point_name,
      is_private: !this.isNotPrivate ? 'true' : 'false',
      is_gps: 'false', // TODO
      pos: this.line.map((p) => `${p[0]} ${p[1]}`).join(','),
      //      time: '', // TODO
      level: this.line.map((p) => p[2]).join(','),
      kind: getKind().join(','),
      note: JSON.stringify([
        //        { pos: 1, txt: 'hogehoge' },
      ]),
      firebase_id_token: `${token}`,
    }

    // ルートをpost
    const graphquery = gql`mutation SaveRoute($id: String, $author: String!, $title: String!, $body:String, $summary: String!, $tag:String, $total_dist:Float!, $total_elevation: Float!, $max_elevation: Float!, $max_slope:Float!, $avg_slope:Float!, $start_point: String!, $goal_point: String!, $is_private:Boolean, $pos: String!, $level:String!, $kind: String, $note:String) {
        saveRoute(route : {id: $id, author: $author, title:$title, body:$body, summary:$summary, tag:$tag, total_dist:$total_dist, total_elevation:$total_elevation, max_elevation:$max_elevation, max_slope:$max_slope, avg_slope:$avg_slope, start_point: $start_point, goal_point:$goal_point, is_private:$is_private, pos:$pos, level:$level, kind:$kind, note:$note} ) { 
          id
        } 
      }`

    this.apollo.mutate({
      mutation: graphquery,
      variables: {
        id: this.route_id || null,
        author: this.author,
        title: `${this.title.replace('\n', '')}`,
        body: this.body,
        summary: RouteModel.getSummary(this.line.map((p) => [p[0], p[1]])),
        tag: this.tags.map((t) => ((typeof t === 'object') ? t.value : t)).join(' '),
        total_dist: Math.round(this.distance * 10) / 10,
        total_elevation: Math.round(this.height_gain * 10) / 10,
        max_elevation: Math.round(this.height_max * 10) / 10,
        max_slope: 0, // TODO
        avg_slope: 0, // TODO
        start_point: start_point_name,
        goal_point: goal_point_name,
        is_private: !this.isNotPrivate,
        pos: polyline.encode(this.line.map((p) => [p[1], p[0]])),
        level: this.line.map((p) => p[2]).join(','),
        kind: getKind().join(','),
        note: JSON.stringify([
          //        { pos: 1, txt: 'hogehoge' },
        ]),
      },
    }).subscribe(({ data }) => {
      const ret: any = data

      this.route_id = ret.saveRoute.id

      if (!this.route_id) {
        alert('ルートの保存に失敗しました。ごめんなさい＞＜')
      }

      window.document.getElementById('share_link_row').style.display = 'block'
      window.document.getElementById('share_link').innerText = `http://routehub.app/watch/${this.route_id}`
      window.document.getElementById('share_link').setAttribute('href', `http://routehub.app/watch/${this.route_id}`)
      // 閲覧ページへのリンクを提示
      if (window.confirm('ルートを保存しました。編集を終了しますか?')) {
        // 状態をリセットするため、画面を再構築
        // this.navCtrl.navigateForward('/watch/' + this.route_id);
        window.document.location.href = `/watch/${this.route_id}`
      }
    })
  }

  moveTop(event) {
    this.navCtrl.navigateForward('/')
  }

  reset(event) {
    console.log('reset')
    event.stopPropagation()
    const that = this

    if (window.confirm('作成中ですがリセットしますか?')) {
      this.editMarkers.map((markerData) => {
        markerData.marker.removeFrom(that.map)
      })
      this.editMarkers = []
      this.line = []
      this.remove_geojson()
      this.elevation.clear()

      that.total_dist_elem.nativeElement.innerText = 0
      that.total_elev_elem.nativeElement.innerText = 0
      that.max_elev_elem.nativeElement.innerText = 0
    }
  }

  importFile(event) {
    console.log('importFile')
    event.stopPropagation()
    alert('現在、インポート機能は準備中です。')
    // document.getElementById("file").click();
  }

  // 一つ戻るボタン(実質最後尾削除)
  deletePresent (event) {
    event.stopPropagation()

    if (this.editMarkers.length == 0) {
      return;
    }

    let marker = this.editMarkers[this.editMarkers.length-1];
    marker.remove_marker();
    this.refresh_route();

    // 2点以上ない場合なグラフをクリアする
    if (this.editMarkers.length < 2) {
      this.elevation.clear()
    }
  }

  toggleRoutingMode(event) {
    console.log('toggleRoutingMode')
    event.stopPropagation()

    this.routingMode += 1
    if (this.routingModeList.length < this.routingMode + 1) {
      this.routingMode = 0
    }

    this.presentToast(`ルート検索モードを${this.routingModeList[this.routingMode].split(',')[0]}に変更`)
  }


  toggleSlopeLayer(event) {
    console.log('toggleSlopeLayer')

    event.stopPropagation()
    if (!this.hotlineLayer && !this.isSlopeMode) {
      this.hotlineLayer = this._routemap.addElevationHotlineLayer(this.line)
      this.presentToast('標高グラデーションモードに変更')
    } else if (this.hotlineLayer && !this.isSlopeMode) {
      this.map.removeLayer(this.hotlineLayer)
      this.hotlineLayer = this._routemap.addSlopeHotlineLayer(this.line)
      this.presentToast('斜度グラデーションモードに変更')
      this.isSlopeMode = true
    } else {
      this.map.removeLayer(this.hotlineLayer)
      this.hotlineLayer = false
      this.isSlopeMode = false
    }
  }

  async presentLayerSelect(event) {
    event.stopPropagation()
    const modal = await this.modalCtrl.create({
      component: LayerselectPage,
      //      componentProps: { route: this.route_data }
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


  toggleLocation(event) {
    event.stopPropagation()
    // 無効化
    if (this.watch_location_subscribe && this.watch_location_subscribe.isStopped !== true) {
      this.presentToast('GPS off')

      this.watch_location_subscribe.unsubscribe()
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
    this.watch_location_subscribe = this.watch.subscribe((pos) => {
      if (this.watch_location_subscribe.isStopped === true) {
        return
      }
      const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude)

      if (!this.currenPossitionMarker) {
        this.currenPossitionMarker = new L.marker(latlng, { icon: this.routemap.gpsIcon }).addTo(this.map)
        this.map.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true }) // 初回のみ移動
      } else {
        this.currenPossitionMarker.setLatLng(latlng)
      }
    })
  }


  async getAddressName(pos) {
    const url = 'https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder'
    const appid = 'dj00aiZpPXlGRWpKYXlpbHA2ZCZzPWNvbnN1bWVyc2VjcmV0Jng9ZTg-'
    const ret = await this.http.jsonp(`${url}?output=json&appid=${appid}&lat=${pos[1]}&lon=${pos[0]}`, 'callback').toPromise().then((res: any) => res)
    try {
      return ret.Feature[0].Property.Address
    } catch (e) {
      return '番地なし'
    }
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
    if (this.loading.dismiss) {
      await this.loading.dismiss()
    }
  }
}


class MarkerData {
  marker: L.marker;

  next_data: MarkerData;

  prev_data: MarkerData;

  route = [];

  bounds: L.latLngBounds;

  height_gain = 0.0;

  height_max = 0.0;

  distance = 0.0;


  constructor(private edit_page: EditPage, latlng: any) {
    const that = this

    const a_marker = L.marker(latlng, { icon: that.edit_page.routemap.editIcon, draggable: true })

    // ポイントドラッグ
    a_marker.on('dragend', (e) => {
      console.log('dragend')
      that.move_marker(e.target._latlng)
    })

    // ポイント削除ポップアップ
    const content = document.createElement('popup')
    content.innerHTML = "<a href='javascript:void(0);'>ポイント削除</a>"
    content.onclick = (e) => {
      that.remove_marker()
    }
    const popup_remove = L.popup().setContent(content)
    a_marker.bindPopup(popup_remove)
    a_marker.on('popupopen', (e) => {
      that.edit_page.canEdit = false
    })
    a_marker.on('popupclose', (e) => {
      that.edit_page.canEdit = true
    })
    this.marker = a_marker
  }

  setIcon(icon: any) {
    this.marker.setIcon(icon)
  }

  // 次のポイント設定
  set_next(a_next_data: MarkerData) {
    const that = this

    that.next_data = a_next_data
    if (a_next_data != null) {
      a_next_data.prev_data = that
    }
  }

  // 前のポイント設定
  set_prev(a_prev_data: MarkerData) {
    const that = this

    that.prev_data = a_prev_data
    if (a_prev_data != null) {
      a_prev_data.next_data = that
    }
  }

  // 自分と次のポイントまでのルートを検索し、latLngBoundsを更新
  async routing() {
    const that = this

    if (that.next_data != null) {
      const start = `${that.marker._latlng.lng},${that.marker._latlng.lat}`
      const goal = `${that.next_data.marker._latlng.lng},${that.next_data.marker._latlng.lat}`

      await that.edit_page.routing([start, goal]).then((_route: any) => {
        that.route = _route

        that.refresh_information()
      })
    } else {
      that.route = []
      that.bounds = null
      that.height_max = 0.0
      that.height_gain = 0.0
      that.distance = 0.0
    }
  }

  refresh_information() {
    const that = this

    if (that.route.length > 0) {
      let current_latlng = L.latLng(that.route[0][1], that.route[0][0])
      let last_latlng = current_latlng
      const latlng_min = current_latlng
      const latlng_max = current_latlng
      let current_height = 0.0
      let last_height = current_height
      that.height_max = current_height
      that.height_gain = 0.0
      that.distance = 0.0

      if (that.route[0].length >= 3) {
        current_height = that.route[0][2]
      }

      for (let i = 1; i < that.route.length; ++i) {
        current_latlng = L.latLng(that.route[i][1], that.route[i][0])

        // 矩形更新
        latlng_max.lat = Math.max(latlng_max.lat, current_latlng.lat)
        latlng_max.lng = Math.max(latlng_max.lng, current_latlng.lng)

        latlng_min.lat = Math.min(latlng_min.lat, current_latlng.lat)
        latlng_min.lng = Math.min(latlng_min.lng, current_latlng.lng)

        // 距離更新
        that.distance += that.edit_page.map.distance(current_latlng, last_latlng) * 0.001

        // 獲得標高、最大標高更新
        current_height = 0.0
        if (that.route[i].length >= 3) {
          current_height = that.route[i][2]
        }
        const height_delta = current_height - last_height

        that.height_max = Math.max(that.height_max, current_height)
        that.height_gain += Math.max(height_delta, 0.0)

        last_latlng = current_latlng
        last_height = current_height
      }

      // latLngBounds更新
      that.bounds = L.latLngBounds(latlng_min, latlng_max)

      //      console.log("distance: " + that.distance);
      //      console.log("height_max: " + that.height_max);
      //      console.log("height_gain: " + that.height_gain);
    } else {
      that.bounds = null
      that.height_max = 0.0
      that.height_gain = 0.0
      that.distance = 0.0
    }
  }

  // 自分の前後のルート検索
  refresh_marker() {
    const that = this

    that.routing().then(() => {
      if (that.prev_data != null) {
        that.prev_data.routing().then(() => {
          that.edit_page.refresh_route()
        })
      } else {
        that.edit_page.refresh_route()
      }
    })
  }

  // MarkerDataを移動し、ルート再検索
  move_marker(a_latlng: L.latLng) {
    const that = this

    that.marker.setLatLng(a_latlng)

    that.refresh_marker()
  }

  // MarkerDataを削除し、前後を繋げ、ルート再検索
  remove_marker() {
    const that = this

    const prev = that.prev_data
    const next = that.next_data

    if (prev != null) {
      prev.set_next(next)
    }
    if (next != null) {
      next.set_prev(prev)
    }

    that.edit_page.remove_markar(that)

    if (prev != null) {
      prev.routing().then(() => {
        that.edit_page.refresh_route()
      })
    } else if (next != null) {
      next.routing().then(() => {
        that.edit_page.refresh_route()
      })
    } else {
      that.edit_page.refresh_route()
    }
  }
}

interface FileReaderEventTarget extends EventTarget {
  result: string;
}
