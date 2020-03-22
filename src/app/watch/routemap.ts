/* eslint-disable class-methods-use-this */
/* eslint-disable new-cap */
import * as L from 'leaflet';
import turfbbox from '@turf/bbox';
import * as turf from '@turf/helpers';
import * as mapboxgl from 'mapbox-gl';
import { LngLatLike } from 'mapbox-gl';

export default class Routemap {
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

  private getYahooLayer() {
    const attrString = '<a href="https://map.yahoo.co.jp/maps?hlat=35.66572&amp;lat=35.66572&amp;hlon=139.731&amp;lon=139.731&amp;z=18&amp;datum=wgs&amp;mode=map&amp;.f=jsapilogo" target="_blank" id="yolp-logo-link" class= "yolp-logo" style="z-index: 10; position: absolute; margin: 0px; padding: 0px; right: 3px; bottom: 3px;" > <img src="https://s.yimg.jp/images/maps/logo/yj_logo.png" alt = "" border="0" > </a>';
    const layer = new L.tileLayer('https://map.c.yimg.jp/m?x={x}&y={y}&z={z}&r=1&style=base:standard&size=512', {
      attribution: attrString,
      maxZoom: 19,
    });
    layer.getTileUrl = function (coord) {
      const z = coord.z + 1;
      const { x } = coord;
      const y = Math.pow(2, coord.z - 1) - coord.y - 1;
      return `https://map.c.yimg.jp/m?x=${x}&y=${y}&z=${z}&r=1&style=base:standard&size=512`;
    };
    return layer;
  }

  private getOSMLayer() {
    const url3 = 'https://tile.openstreetmap.jp/{z}/{x}/{y}.png';
    const layer = L.tileLayer(url3, {
      attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      maxZoom: 19,
    });
    return layer;
  }

  private getOSMCycleLayer() {
    const url = 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=8ff577dddcc24dbd945e80ef152bf1e5';
    const layer = L.tileLayer(url, {
      attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      maxZoom: 19,
    });
    return layer;
  }

  private getGSILayer() {
    return L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
    });
  }

  createMap(mapele) {
    Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set('pk.eyJ1Ijoicm91dGVodWIiLCJhIjoiY2s3c2tzNndwMG12NjNrcDM2dm1xamQ3bSJ9.fHdfoSXDhbyboKWznJ53Cw');
    const center: any = [35.681, 139.767];
    const styleId = 'ck7sl13lr2bgw1isx42telruq';
    const rasterUrl = `https://api.mapbox.com/styles/v1/routehub/${styleId}/tiles/{z}/{x}/{y}@2x?access_token=${mapboxgl.accessToken}`;
    const mapMb = new mapboxgl.Map({
      container: mapele, // container id
      style: {
        version: 8,
        sources: {
          'default-tiles': {
            type: 'raster',
            tiles: [
              rasterUrl,
            ],
            tileSize: 256
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
      center: [center[1], center[0]], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });

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
    // return L.latLngBounds([ // いい感じの範囲にするために調整
    //     [bbox[1] * 1 - latplus, bbox[0] * 1 - lonplus],
    //     [bbox[3] * 1 + latplus, bbox[2] * 1 + lonplus],
    // ]);
  }
}
