import * as L from 'leaflet'
import * as Elevation from 'leaflet.elevation/src/L.Control.Elevation.js'
import * as Hotline from 'leaflet-hotline'
import turfbbox from '@turf/bbox'
import * as turf from '@turf/helpers'
import * as AnimatedMarker from './animatedMarker.js'
/** *
 * ルートModel
 * いろんなところで使いまわしたい
 */
export class Route {
  id: string;

  title: string;

  body: string;

  tag: string;

  author: string;

  summary: string;

  thumburl: string;

  isGps: boolean;

  isPrivate: boolean;

  createdAt: string;

  /*
  private staticmap_url = 'https://map.yahooapis.jp/map/V1/static';

  private thumbappid = 'dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-';

  private getThumbUrl(summary) {
    const line = summary.slice(11, -1).split(',').map((pos) => {
      const p = pos.split(' ')
      return `${p[1]},${p[0]}`
    }).join(',')
    return `${this.staticmap_url}?appid=${this.thumbappid
    }&autoscale=on&scalebar=off&width=450&height=300&l=` + `0,0,255,105,4,${ // rgb, a, weight
      line}`
  }
  */
}

export class Routemap {
  gpsIcon = new L.icon({
    iconUrl: '/assets/icon/gps_icon.png',
    iconSize: [20, 20], // size of the icon
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
  });

  startIcon = new L.icon({
    iconUrl: '/assets/icon/start_icon.png',
    iconSize: [50, 27], // size of the icon
    iconAnchor: [52, 27], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
  });

  goalIcon = new L.icon({
    iconUrl: '/assets/icon/goal_icon.png',
    iconSize: [50, 27], // size of the icon
    iconAnchor: [-2, 27], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
  });

  commentIcon = new L.icon({
    iconUrl: '/assets/icon/comment_icon.png',
    iconSize: [20, 20], // size of the icon
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
  });

  editIcon = new L.icon({
    iconUrl: '/assets/icon/edit_icon.png',
    iconSize: [14, 14], // size of the icon
    iconAnchor: [7, 7], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
    className: 'map-editIcon',
  });

  private getYahooLayer() {
    const attrString = '<a href="https://map.yahoo.co.jp/maps?hlat=35.66572&amp;lat=35.66572&amp;hlon=139.731&amp;lon=139.731&amp;z=18&amp;datum=wgs&amp;mode=map&amp;.f=jsapilogo" target="_blank" id="yolp-logo-link" class= "yolp-logo" style="z-index: 10; position: absolute; margin: 0px; padding: 0px; right: 3px; bottom: 3px;" > <img src="https://s.yimg.jp/images/maps/logo/yj_logo.png" alt = "" border="0" > </a>'
    const layer = new L.tileLayer('https://map.c.yimg.jp/m?x={x}&y={y}&z={z}&r=1&style=base:standard&size=512', {
      attribution: attrString,
      maxZoom: 19,
    })
    layer.getTileUrl = function (coord) {
      const z = coord.z + 1
      const { x } = coord
      const y = Math.pow(2, coord.z - 1) - coord.y - 1
      return `https://map.c.yimg.jp/m?x=${x}&y=${y}&z=${z}&r=1&style=base:standard&size=512`
    }
    return layer
  }

  private getOSMLayer() {
    // const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    // const url2 = 'https://www.toolserver.org/tiles/hikebike/{z}/{x}/{y}.png'
    const url3 = 'https://tile.openstreetmap.jp/{z}/{x}/{y}.png'
    // const url4 = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
    const layer = L.tileLayer(url3, {
      attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      maxZoom: 19,
    })
    return layer
  }

  private getOSMCycleLayer() {
    const url = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=8ff577dddcc24dbd945e80ef152bf1e5'
    const layer = L.tileLayer(url, {
      attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      maxZoom: 19,
    })
    return layer
  }

  private getGSILayer() {
    return L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
    })
  }

  constructor() {
    Elevation
    Hotline
    AnimatedMarker
  }

  createMap(mapele) {
    const center: any = [35.681, 139.767]
    const map = L.map(mapele, { center, zoom: 9, zoomControl: false })

    const baselayers = {
      OSM: this.getOSMLayer(),
      'OSM Cycle': this.getOSMCycleLayer(),
      Yahoo: this.getYahooLayer(),
      GSI: this.getGSILayer(),
    }
    const overlays = {}
    L.control.layers(baselayers, overlays).addTo(map)
    baselayers.OSM.addTo(map)

    // スケールコントロールを追加（オプションはフィート単位を非表示）
    // TODO画面の設計を考えてじゃまにならないように配置したい
    L.control.scale({ imperial: false }).addTo(map)

    // elevation
    const elevation = L.control.elevation({
      position: 'bottomright',
      theme: 'steelblue-theme',
      // TODO : ウィンドウサイズ変更イベントに対応する
      width: window.innerWidth - 10,
      height: 100,
      margins: {
        top: 0,
        right: 5,
        bottom: 0,
        left: 0,
      },
      yAxisMin: 0,
      useHeightIndicator: true,
      isInnerLabel: true,
      tooltips: true,
      tooltipsLabel: {
        dist: '距離',
        elevation: '標高',
        slope: '斜度',
        distDiff: '距離差',
        elevationDiff: '標高差',
        slopeAverage: '平均斜度',
      },
      addSlope: true,
    }).addTo(map)

    return {
      map,
      elevation,
      addAnimatedMarker: (line) => {
        const latlnglist = line.map((l) => [l[1], l[0]])
        const animatedMarker = L.animatedMarker(latlnglist, { icon: this.gpsIcon })
        map.addLayer(animatedMarker)
        return animatedMarker
      },
      addElevationHotlineLayer: (line) => {
        const maxElev = Math.max.apply(null, line.map((l) => l[2]))
        const latlngelevlist = line.map((l) => [l[1], l[0], l[2] / maxElev])
        return L.hotline(latlngelevlist, {
          outlineWidth: 1,
          outlineColor: 'blue',
        }).addTo(map)
      },
      addSlopeHotlineLayer: (line) => {
        let prevPoint
        let prevElevation
        const latlngelevlist = line.map((l) => {
          let slope = 0
          if (prevPoint) {
            const point = L.latLng(l[1], [0])
            const distDiff = point.distanceTo(prevPoint)
            const elevDiff = l[2] - prevElevation
            slope = Math.ceil(elevDiff / distDiff * 100 * 100) / 100
            if (Math.abs(slope) > 20 && slope > 20) {
              slope = 20
            } else if (Math.abs(slope) > 20 && slope < 20) {
              slope = -20
            } else if (!slope) {
              slope = 0
            }

            prevPoint = point
          } else {
            prevPoint = L.latLng(l[1], [0])
          }
          prevElevation = l[2]
          return [l[1], l[0], slope]
        })
        return L.hotline(latlngelevlist, {
          outlineWidth: 1,
          outlineColor: 'blue',
          min: -20,
          max: 20,
          palette: { 0.0: 'blue', 0.4: '#6aff70', 1.0: 'red' },
        }).addTo(map)
      },
    }
  }

  posToLatLngBounds(pos) {
    const line = turf.lineString(pos)
    const bbox = turfbbox(line) // lonlat問題...
    const latplus = Math.abs(bbox[1] - bbox[3]) * 0.1
    const lonplus = Math.abs(bbox[0] - bbox[2]) * 0.1
    return L.latLngBounds([ // いい感じの範囲にするために調整
      [bbox[1] * 1 - latplus, bbox[0] * 1 - lonplus],
      [bbox[3] * 1 + latplus, bbox[2] * 1 + lonplus],
    ])
  }
}
