import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, Events } from '@ionic/angular';
import { ɵPLATFORM_WORKER_UI_ID } from '@angular/common';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as firebase from 'firebase/app';
import 'firebase/auth';

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
  idToken;

  items: Array<{
    id: string,
    title: string;
    body: string;
    author: string;
    thumburl: string;
    created_at: string;
    total_dist: number;
    total_elevation: number;
    max_elevation: number;
    max_slope: number;
    avg_slope: number;
    start_point: string;
    goal_point: string;
  }> = [];

  constructor(
    private navCtrl: NavController,
    private storage: Storage,
    private http: HttpClient,
    public events: Events,
  ) { }

  ngOnInit() {
    // ログイン確認
    var that = this;
    // TODO : なんかココらへん処理をまとめたほうが良さそう, JSONで格納したほうがよさそう
    this.storage.get('user.uid').then((uid) => {
      if (ɵPLATFORM_WORKER_UI_ID == null || uid == '') {
        this.navCtrl.navigateForward('/login');
      }
      that.uid = uid;
    }).catch(e => {
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
    const url = environment.api.host + environment.api.my_path;

    this.get(url);
  }

  showLikeRoute() {
    this.items = [];
    const url = environment.api.host + environment.api.like_path;
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
    if (!this.idToken) {
      this.idToken = await firebase.auth().currentUser.getIdToken(true);
      if (!this.idToken || this.idToken === '') {
        this.navCtrl.navigateForward('/login');
      }
    }

    // あきらめ
    url += '?firebase_id_token=' + this.idToken;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': ' application/x-www-form-urlencoded',
      })
    };
    httpOptions.headers.set('fireabase_auth_token', this.idToken);

    return this.http.get(url, httpOptions).toPromise()
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
            created_at: r.created_at.slice(0, -14).replace(/-/g, '/'),
            total_dist: r.total_dist,
            total_elevation: r.total_elevation,
            max_elevation: r.max_elevation,
            max_slope: r.max_slope,
            avg_slope: r.avg_slope,
            start_point: r.start_point,
            goal_point: r.goal_point,
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

  logout() {
    this.events.publish('user:logout');
    this.navCtrl.navigateForward('/login');
  }

}
