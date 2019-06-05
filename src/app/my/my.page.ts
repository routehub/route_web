import { RouteHubUser } from './../model/routehubuser';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform, NavController, Events } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Route } from '../watch/routemap';
import { RouteModel } from '../model/routemodel';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss', '../list/list.page.scss'],
})
export class MyPage implements OnInit {

  user: RouteHubUser;
  display_name: string;
  isMyRoute: Boolean;

  items: Array<RouteModel> = [];

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

  delete(item) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].id === item.id) {
        // UIから削除
        this.items.splice(i, 1);
        // DBから削除
        const httpOptions = {
          headers: new HttpHeaders(
            'Content-Type:application/x-www-form-urlencoded'
          )
        };
        const url = environment.api.host + environment.api.route_delete_path;
        this.http.post(url,
          'firebase_id_token=' + this.user.token + '&' + 'id=' + item.id,
          httpOptions).toPromise();
      }
    }
  }

  showMyRoute() {
    this.isMyRoute = true;
    this.items = [];
    const url = environment.api.host + environment.api.my_path;

    this.getMyLikeRoute(url);
  }

  showLikeRoute() {
    this.isMyRoute = false;
    this.items = [];
    const url = environment.api.host + environment.api.like_path;
    this.getMyLikeRoute(url);
  }

  ionViewWillEnter() {
    // TODO : 遷移きちんと確認した暗号つくる
    this.showMyRoute();
    window.document.title = 'マイページ RouteHub'
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
          let r = new RouteModel();
          r.setData(res.results[i]);
          this.items.push(r);
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
