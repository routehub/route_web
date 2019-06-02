import { RouteHubUser } from './../model/routehubuser';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform, NavController, Events } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Route } from '../watch/routemap';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss', '../list/list.page.scss'],
})
export class MyPage implements OnInit {

  user: RouteHubUser;
  display_name: string;

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
    public platform: Platform,
  ) { }

  ngOnInit() {
    // ログイン
    let that = this;
    this.storage.get('user').then((json) => {
      if (!json || json == "") {
        return;
      }
      that.user = JSON.parse(json);
      that.display_name = that.user.nickname + "";
    });
  }

  showMyRoute() {
    this.items = [];
    const url = environment.api.host + environment.api.my_path;

    this.getMyLikeRoute(url);
  }

  showLikeRoute() {
    this.items = [];
    const url = environment.api.host + environment.api.like_path;
    this.getMyLikeRoute(url);
  }

  ionViewWillEnter() {
    // TODO : 遷移きちんと確認した暗号つくる
    this.showMyRoute();
  }
  pageSelected(item) {
    this.navCtrl.navigateForward('/watch/' + item.id);
  }

  displayNameChanged() {
    const httpOptions = {
      headers: new HttpHeaders(
        'Content-Type:application/x-www-form-urlencoded'
      )
    };
    const url = environment.api.host + environment.api.user_path;
    this.http.post(url,
      'firebase_id_token=' + this.user.token + '&' + 'display_name=' + this.display_name,
      httpOptions).toPromise();
  }

  async getMyLikeRoute(url) {
    if (!this.user) {
      if (firebase.auth().currentUser) {
        let idtoken = await firebase.auth().currentUser.getIdToken(true);
        if (!idtoken || idtoken === '') {
          this.navCtrl.navigateForward('/login');
        }
      } else {
        // 多分0.2msぐらい待てばいいはずだけど、面倒なのでreturn
        return;
      }
    }

    url += '?firebase_id_token=' + this.user.token
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': ' application/x-www-form-urlencoded',
      })
    };
    httpOptions.headers.set('fireabase_auth_token', this.user.token + ""); // String is not string

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
