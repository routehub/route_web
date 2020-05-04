import * as L from 'leaflet'
import turfbbox from '@turf/bbox'
import * as turf from '@turf/helpers'
import * as mapboxgl from 'mapbox-gl'
import { LngLatLike } from 'mapbox-gl'
import { Copyright } from 'gpx-builder/dist/builder/BaseBuilder/models'
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
Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set('pk.eyJ1Ijoicm91dGVodWIiLCJhIjoiY2s3c2tzNndwMG12NjNrcDM2dm1xamQ3bSJ9.fHdfoSXDhbyboKWznJ53Cw');
const styleId = 'ck7sl13lr2bgw1isx42telruq';

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
    url: `https://api.mapbox.com/styles/v1/routehub/${styleId}/tiles/{z}/{x}/{y}?access_token=${mapboxgl.accessToken}`,
    copyright: ''
  },
  OSM: {
    url: 'https://tile.openstreetmap.jp/{z}/{x}/{y}.png',
    copyright: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
  },
  OPEN_CYCLE_LAYER: {
    url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=8ff577dddcc24dbd945e80ef152bf1e5',
    copyright: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
  },
  GSI: {
    url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    copyright: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
  }
}

export class Routemap {
  gpsIcon = new L.icon({
    iconUrl: '/assets/icon/gps_icon.png',
    iconSize: [20, 20], // size of the icon
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
  });

  startIcon = {
    iconUrl: '/assets/icon/start_icon.png',
    iconSize: [50, 27], // size of the icon
    iconAnchor: [52, 27], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
  };

  goalIcon = {
    iconUrl: '/assets/icon/goal_icon.png',
    iconSize: [50, 27], // size of the icon
    iconAnchor: [-2, 27], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
  };

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

  private static currentMap = null;
  public static getCurrent = (): mapboxgl.Map | null => {
    return Routemap.currentMap;
  }

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
    });
  }

  createMap(mapele: string, isVector?: boolean) {
    const defaultCenter = [35.681, 139.767];
    const defaultZoom = 9;

    let mapMb = null;
    if (isVector) {
      // vector地図
      mapMb = new mapboxgl.Map({
        container: mapele,
        style: 'mapbox://styles/routehub/ck7sl13lr2bgw1isx42telruq',
        center: [defaultCenter[1], defaultCenter[0]],
        zoom: defaultZoom,
      });
    } else {
      const rasterUrl = `https://api.mapbox.com/styles/v1/routehub/${styleId}/tiles/{z}/{x}/{y}?access_token=${mapboxgl.accessToken}`;

      mapMb = new mapboxgl.Map({
        container: mapele,
        style: {
          version: 8,
          sources: {
            'default-tiles': {
              type: 'raster',
              tiles: [
                rasterStyleInfo.DEFAULT.url
              ],
              tileSize: 256,
              attribution: rasterStyleInfo.DEFAULT.copyright
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
      });
    }
    Routemap.currentMap = mapMb;

    return {
      map: mapMb,
    };
  }

  posToLatLngBounds(pos) {
    const line = turf.lineString(pos);
    const bbox = turfbbox(line); // lonlat問題...
    const latplus = Math.abs(bbox[1] - bbox[3]) * 0.1;
    const lonplus = Math.abs(bbox[0] - bbox[2]) * 0.1;
    const sw = [bbox[0] * 1 - lonplus, bbox[1] * 1 - latplus] as LngLatLike;
    const ne = [bbox[2] * 1 + lonplus, bbox[3] * 1 + latplus] as LngLatLike;
    return new mapboxgl.LngLatBounds(sw, ne);
  }

  func(coordinates: Array<Array<number>>): mapboxgl.Expression {
    const length = coordinates.length;
    const color = [];
    coordinates.forEach((c, i) => {
      const v = i / length;
      color.push(v);
      color.push(this.getColor(c[2]));
    });


    return [
      'interpolate',
      ['linear'],
      ['line-progress'],
      ...color
    ];
  }

  renderRouteLayer(map: mapboxgl.Map, lineGeoJSON: mapboxgl.GeoJSONSourceRaw) {
    if (map.getLayer('route') !== undefined) {
      map.removeSource('route');
      map.removeLayer('route');
    }
    map.addSource('route', lineGeoJSON);

    const feature = lineGeoJSON.data as any;
    const coordinates = feature.geometry.coordinates;
    map.addLayer({
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
        'line-gradient': this.func(coordinates)
      }
    });

    this.createMarker(this.startIcon, 'marker-start', {
      anchor: 'bottom-right'
    })
      .setLngLat([coordinates[0][0], coordinates[0][1]])
      .addTo(map);

    this.createMarker(this.goalIcon, 'marker-goal', { anchor: "bottom-left", offset: [0, -27] })
      .setLngLat([coordinates[coordinates.length - 1][0], coordinates[coordinates.length - 1][1]])
      .addTo(map);

    // 描画範囲をよろしくする
    map.fitBounds(this.posToLatLngBounds(coordinates));
  }

  createMarker(iconInfo: any, className: string, option: mapboxgl.MarkerOptions) {
    const startEl = document.createElement('div');
    startEl.className = className;
    startEl.style.backgroundImage = `url(${iconInfo.iconUrl})`;
    startEl.style.backgroundSize = 'cover';
    startEl.style.width = iconInfo.iconSize[0] + 'px';
    startEl.style.height = iconInfo.iconSize[1] + 'px';
    return new mapboxgl.Marker(startEl, option)
  }

  getColor(x) {
    return x < 20 ? 'blue' :
      x < 40 ? 'royalblue' :
        x < 60 ? 'cyan' :
          x < 80 ? 'lime' :
            x < 100 ? 'red' :
              'blue';
  }

  public static createRasterTile(rasterStyleInfo: RasterStyle): mapboxgl.Style {
    return {
      version: 8,
      sources: {
        'base-raster-source': {
          type: 'raster',
          tiles: [
            rasterStyleInfo.url,
          ],
          tileSize: 256,
          attribution: rasterStyleInfo.copyright
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
}
