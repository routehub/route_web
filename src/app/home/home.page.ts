import { Component, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  @ViewChild('map') map_elem: ElementRef;
  map: any;

  ionViewWillEnter() {
    //    this.map.invalidateSize();
  }

  ionViewDidEnter() {
    // tslint:disable-next-line:no-unused-expression
    let center: any = [35.681, 139.767];
    this.map = L.map(this.map_elem.nativeElement, { center: center, zoom: 9 });

    // OSM
    let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    // 地理院タイル（標準地図）レイヤー設定	
    let std = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
      attribution: "地理院タイル（標準地図）",
    }).addTo(this.map);
    // AltGoogle
    /*
    let google = L.tileLayer('https://s3-ap-northeast-1.amazonaws.com/naraemon-gmaps/xyz/base/{z}/{x}/{y}.png', {
      attribution: "Google地図",
    }).addTo(this.map);
    */
    // yahoo
    // https://github.com/Leaflet/Leaaflet/blob/37d2fd15ad6518c254fae3e033177e96c48b5012/src/layer/tile/TileLayer.js
    class YahooLayer extends L.TileLayer {
      // TODO : ほんとはこんな漢字でちゃんんと軽傷したい
    }

    let yahoo = L.tileLayer('https://map.c.yimg.jp/m?x={x}&y={y}&z={z}&r=1&style=base:standard&size=512');
    // FIXME: 実行時にもとクラスの定義を書き換えちゃってる
    yahoo.__proto__.getTileUrl = function (coord) {
      let z = coord.z + 1;
      let x = coord.x;
      let y = Math.pow(2, coord.z - 1) - coord.y - 1;
      return 'https://map.c.yimg.jp/m?x=' + x + '&y=' + y + '&z=' + z + '&r=1&style=base:standard&size=512';
    }
    yahoo.addTo(this.map)
    let base_layers = [osm, std, yahoo];
    L.control.layers(base_layers).addTo(this.map);

  }
}
