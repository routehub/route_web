import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { ɵPLATFORM_WORKER_UI_ID } from '@angular/common';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss', '../list/list.page.scss'],
})
export class MyPage implements OnInit {

  uid;
  photoURL;
  displayName;
  body = "最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない"

  items: Array<{
    id: string,
    title: string;
    body: string;
    author: string;
    thumburl: string;
    created_at: string;
  }> = [];

  constructor(
    private navCtrl: NavController,
    private storage: Storage,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    // ログイン確認
    var that = this;
    // TODO : なんかココらへん処理をまとめたほうが良さそう, JSONで格納したほうがよさそう
    this.storage.get('user.uid').then((uid) => {
      // 非ログインの場合は /loginへ遷移
      if (ɵPLATFORM_WORKER_UI_ID == null) {
        this.navCtrl.navigateForward('/login');
      }
      that.uid = uid;
    }).catch(e => {
      // 非ログインの場合は /loginへ遷移
      this.navCtrl.navigateForward('/login');
    });
    this.storage.get('user.displayName').then((displayName) => {
      this.displayName = displayName;
    });
    this.storage.get('user.photoURL').then((photoURL) => {
      that.photoURL = photoURL;
    });

  }

  showMyRoute() {
    this.items = [];
    // TODO : APIのエントリーポイントを変える
    const url = environment.api.host + environment.api.search_path + '?q=kaz.141&mode=author';
    this.get(url);
  }

  showLikeRoute() {
    this.items = [];
    // TODO : APIのエントリーポイントを変える
    const url = environment.api.host + environment.api.search_path + '?q=北海道';
    this.get(url);
  }

  ionViewWillEnter() {
    // TODO : 遷移きちんと確認した暗号つくる
    this.showMyRoute();
  }
  pageSelected(item) {
    this.navCtrl.navigateForward('/watch/' + item.id);
  }
  async get(url) {
    return this.http.get(url).toPromise()
      .then((res: any) => {
        if (!res.results) {
          return;
        }
        for (let i = 0; i < res.results.length; i++) {
          let r = res.results[i];
          this.items.push({
            id: r.id,
            title: r.title,
            body: this.getBodyHead(r.body),
            author: r.author === '' ? '名も無きルート引き' : r.author,
            thumburl: this.getThumbUrl(r.summary),
            created_at: r.created_at,
          });
        }

        const response: any = res;
        return response;
      });
  }

  private getBodyHead(body) {
    let limit = 70;
    if (body.length < limit) {
      return body;
    }
    return body.substr(0, limit) + '...';
  }

  private getThumbUrl(summary) {
    let line = summary.slice(11, -1).split(',').map(pos => {
      let p = pos.split(' ');
      return p[1] + ',' + p[0];
    }).join(',');
    return environment.api.staticmap_url + '?appid=' + environment.api.thumbappid
      + '&autoscale=on&scalebar=off&width=450&height=300&l=' + '0,0,255,105,4,' // rgb, a, weight
      + line;
  }


  // TODO ログアウトリンクはこのページのどこかに置く

}
