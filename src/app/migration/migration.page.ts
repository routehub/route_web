import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { RouteHubUser } from './../model/routehubuser';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-migration',
  templateUrl: './migration.page.html',
  styleUrls: ['./migration.page.scss'],
})
export class MigrationPage implements OnInit {
  @ViewChild('importarea') importarea: ElementRef;

  user: RouteHubUser;
  public routeurl: string;
  public items: Array<{ id: string, title: string; author: string; icon: string; color: string; }> = [];
  private migrate_url = environment.api.host + environment.api.migrate_path;
  private parse_shorturl_url = environment.api.host + environment.api.expand_url_path;

  constructor(
    private http: HttpClient,
    public navCtrl: NavController,
    private storage: Storage,
  ) { }

  ngOnInit() {
    // ログイン
    let that = this;
    this.storage.get('user').then((json) => {
      if (!json || json == "") {
        return;
      }
      that.user = JSON.parse(json);
    });
  }

  ionViewWillEnter() {
    window.document.title = 'ルートを取り込み RouteHub(β)'
  }

  async onPaste(event) {
    event.preventDefault();
    //    if (window.clipboardData && window.clipboardData.getData) { // IE pollyfillされるかな...
    //      var pastedText = window.clipboardData.getData('Text');
    //    } else 
    if (!event.clipboardData || !event.clipboardData.getData) {
      return;
    }

    let pastedText: string = event.clipboardData.getData('text/html');
    let m = pastedText.match(/watch\?id=(.*?)"/g);

    if (!m || m.length <= 0) {
      console.log('pasted, but clipboard empty url.');
      return;
    }
    var ids = [];
    for (let i = 0; i < m.length; i++) {
      let id_m = m[i].match(/watch\?id=(.+?)"/);
      if (!ids.includes(id_m[1])) {
        ids.push(id_m[1]);
      }
    }
    for (let i = 0; i < ids.length; i++) {
      this.items.push({
        id: ids[i],
        title: ids[i],
        author: '',
        icon: '',
        color: '',
      });
    }

    await this.checkque();
  }

  async importUrl() {
    if (!this.routeurl) {
      return;
    }
    let m = this.routeurl.match(/watch\?id=(.*?)$/);

    if (!m) {
      let ret = await this.parseShorUrl(this.routeurl);
      console.dir(ret);
      m = String(ret).match(/watch\?id=(.*?)$/);
      if (!m) {
        return;
      }
    }
    this.items.push({
      id: m[1],
      title: m[1],
      author: '',
      icon: '',
      color: '',
    });
    await this.checkque();
    this.routeurl = '';
  }

  async checkque() {
    for (let i = 0; i < this.items.length; i++) {
      let item = this.items[i];
      if (item.color !== '') {
        return;
      }

      try {
        // オブジェクトだとBE側のBodyのkeyに全部入りしてたのでとりあえずJSONで
        const paramString = 'id=' + item.id + '&' + 'firebase_id_token=' + this.user.token
        const httpOptions = {
          headers: new HttpHeaders(
            'Content-Type:application/x-www-form-urlencoded'
          )
        };

        const res: any = await this.http.post(this.migrate_url, paramString, httpOptions).toPromise();

        if (res.error || !res.title) {
          item.title = '取り込みエラー';
          item.color = 'danger';
          return;
        }
        item.title = res.title;
        item.author = res.auhor;
        item.color = 'primary';
      } catch (fallback) {
        console.dir(fallback);
        item.color = 'danger';
      }
    }
  }

  async parseShorUrl(url) {
    return await this.http.get(this.parse_shorturl_url + '?url=' + url).toPromise().then((res: any) => {
      return res.url;
    });
  }

  pageSelected(item) {
    this.navCtrl.navigateForward('/watch/' + item.id);
  }

}
