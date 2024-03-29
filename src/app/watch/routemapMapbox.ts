/* eslint-disable no-nested-ternary */
import turfbbox from '@turf/bbox'
import * as turf from '@turf/helpers'
import distance from '@turf/distance'
import * as maplibregl from 'maplibre-gl'
import { LngLatLike } from 'maplibre-gl'
import * as chroma from 'chroma-js'

// eslint-disable-next-line max-len
// Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set('pk.eyJ1Ijoicm91dGVodWIiLCJhIjoiY2w3NjZoeGJ3MDhnMDNubWk2MWdpNG15diJ9.-viZ5gtnqX6qg2eRpjLNBA')
// const styleId = 'ck7sl13lr2bgw1isx42telruq'

interface RasterStyle {
  url: string,
  copyright: string
}
interface RasterStyleInfo {
  DEFAULT: RasterStyle,
  OSM: RasterStyle,
  OPEN_CYCLE_LAYER: RasterStyle,
  GSI: RasterStyle
}

export const rasterStyleInfo: RasterStyleInfo = {
  DEFAULT: {
    url: 'https://tile.openstreetmap.jp/{z}/{x}/{y}.png',
    copyright: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  },
  OSM: {
    url: 'https://tile.openstreetmap.jp/{z}/{x}/{y}.png',
    copyright: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  },
  OPEN_CYCLE_LAYER: {
    url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=8ff577dddcc24dbd945e80ef152bf1e5',
    copyright: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  },
  GSI: {
    url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    copyright: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
  },
}

export interface IconInfo {
  iconUrl?: string,
  iconSize: [number, number],
  iconAnchor: [number, number],
  popupAnchor: [number, number],
  className?: string,
}

export const elevationIcon: IconInfo = {
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, 0],
}
export const gpsIcon: IconInfo = {
  iconUrl: '/assets/icon/gps_icon.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, 0],
}
export const startIcon: IconInfo = {
  iconUrl: '../../assets/icon/start_icon.png',
  iconSize: [50, 27],
  iconAnchor: [52, 27],
  popupAnchor: [0, 0],
}
export const goalIcon: IconInfo = {
  iconUrl: './assets/icon/goal_icon.png',
  iconSize: [50, 27],
  iconAnchor: [-2, 27],
  popupAnchor: [0, 0],
}
export const commentIcon: IconInfo = {
  iconUrl: '/assets/icon/comment_icon.png',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, 0],
}
export const editIcon: IconInfo = {
  iconUrl: '/assets/icon/edit_icon.png',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, 0],
  className: 'map-editIcon',
}
export class RoutemapMapbox {
  private static currentMap = null;

  public static routeLayer = null;

  public static getCurrent = (): maplibregl.Map | null => RoutemapMapbox.currentMap

  createMap(mapele: string, isVector?: boolean) {
    const defaultCenter = [35.681, 139.767]
    const defaultZoom = 9

    let mapMb = null
    if (isVector) {
      mapMb = new maplibregl.Map({
        container: mapele,
        style: RoutemapMapbox.getVectorStyle(),
        center: [defaultCenter[1], defaultCenter[0]],
        zoom: defaultZoom,
        attributionControl: false,
      })
      mapMb.addControl(new maplibregl.AttributionControl(), 'top-left')
    } else {
      mapMb = new maplibregl.Map({
        container: mapele,
        style: {
          version: 8,
          sources: {
            'default-tiles': {
              type: 'raster',
              tiles: [
                rasterStyleInfo.DEFAULT.url,
              ],
              tileSize: 256,
              attribution: rasterStyleInfo.DEFAULT.copyright,
            },
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'default-tiles',
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        },
        center: [defaultCenter[1], defaultCenter[0]],
        zoom: defaultZoom,
      })
    }
    RoutemapMapbox.currentMap = mapMb

    return {
      map: mapMb,
    }
  }

  posToLatLngBounds(pos) {
    const line = turf.lineString(pos)
    const bbox = turfbbox(line) // lonlat問題...
    const latplus = Math.abs(bbox[1] - bbox[3]) * 0.1
    const lonplus = Math.abs(bbox[0] - bbox[2]) * 0.1
    const sw = [bbox[0] * 1 - lonplus, bbox[1] * 1 - latplus] as LngLatLike
    const ne = [bbox[2] * 1 + lonplus, bbox[3] * 1 + latplus] as LngLatLike
    return new maplibregl.LngLatBounds(sw, ne)
  }

  func(coordinates: Array<Array<number>>, mode: string): maplibregl.Expression {
    const { length } = coordinates
    // 標高の最大値を求める
    const maxHeight = coordinates.map((a) => a[2]).reduce((a, b) => Math.max(a, b))

    const color = []

    if (mode === 'slope') {
      coordinates.forEach((c, i) => {
        const v = i / length
        color.push(v)
        color.push(this.getSlopeColor(c, coordinates[i + 1]))
        // color.push(this.getHeightColor(c[2], maxHeight))
      })
    } else {
      coordinates.forEach((c, i) => {
        const v = i / length
        color.push(v)
        color.push(this.getHeightColor(c[2], maxHeight))
      })
    }
    return [
      'interpolate',
      ['linear'],
      ['line-progress'],
      ...color,
    ]
  }

  renderRouteLayer(map: maplibregl.Map, lineGeoJSON: maplibregl.GeoJSONSourceRaw, mode: string) {
    if (map.getLayer('route')) {
      map.removeLayer('route')
    }
    if (map.getSource('route')) {
      map.removeSource('route')
    }
    map.addSource('route', lineGeoJSON)

    const feature = lineGeoJSON.data as any
    const { coordinates } = feature.geometry

    const paint = mode === null ? {
      'line-color': '#0000ff',
      'line-width': 6,
      'line-opacity': 0.7,
    } : {
      'line-color': '#0000ff',
      'line-width': 6,
      'line-opacity': 0.7,
      'line-gradient': this.func(coordinates, mode),
    }
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint,
    })

    // 描画範囲をよろしくする
    map.fitBounds(this.posToLatLngBounds(coordinates), { duration: 0 })
  }

  createMarker(
    iconInfo?: IconInfo,
    option?: maplibregl.MarkerOptions,
    className?: string,
  ): maplibregl.Marker {
    const startEl = document.createElement('div')
    if (iconInfo) {
      startEl.style.backgroundImage = `url(${iconInfo.iconUrl})`
      startEl.style.backgroundSize = 'cover'
      startEl.style.width = `${iconInfo.iconSize[0]}px`
      startEl.style.height = `${iconInfo.iconSize[1]}px`
    } else if (className) {
      startEl.className = className
    }
    return new maplibregl.Marker(startEl, option)
  }

  getHeightColor(height, maxHeight) {
    return chroma.scale(['blue', 'green', 'yellow', 'red', 'black'])(height / maxHeight).hex()
  }

  getSlopeColor(current, next) {
    const pallet = ['blue', 'green', 'red']
    if (!next) {
      return chroma.scale(pallet)(0.5).hex()
    }

    // calcurate slope : https://tomari.org/main/java/koubai_keisan.html
    const dist = distance(current, next) * 1000 // km to m
    const heightDiff = next[2] - current[2]
    const slope = heightDiff * 100 / dist
    // -20度~+20度の間を0...1で表す
    const percentageSlope = (slope + 20) / 40
    return chroma.scale(pallet)(percentageSlope).hex()
  }

  public static getVectorStyle(): string {
    return 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json'
  }


  public static createRasterTile(rasterStyle: RasterStyle): maplibregl.Style {
    return {
      version: 8,
      sources: {
        'base-raster-source': {
          type: 'raster',
          tiles: [
            rasterStyle.url,
          ],
          tileSize: 256,
          attribution: rasterStyle.copyright,
        },
      },
      layers: [
        {
          id: 'base-raster-layer',
          type: 'raster',
          source: 'base-raster-source',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    }
  }

  public static toBounds(lngLats: maplibregl.LngLat[]): maplibregl.LngLatBounds | null {
    if (lngLats.length === 0) {
      return null
    }

    const bounds = new maplibregl.LngLatBounds()
    lngLats.forEach((ll) => {
      bounds.extend(ll)
    })
    return bounds
  }
}
