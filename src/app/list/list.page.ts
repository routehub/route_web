import { Route } from './../watch/routemap';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IonInfiniteScroll, NavController, PopoverController } from '@ionic/angular';
import { SearchSettingComponent } from '../search-setting/search-setting.component';
import { Location } from '@angular/common';
import { environment } from '../../environments/environment';
import { RouteModel } from '../model/routemodel';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  private search_url = environment.api.host + environment.api.search_path;


  /**
   * 検索用パラメーター
   */
  private page = 1;
  private per_page = 6;
  public query = ''; // viewとも共通
  private query_type = 'keyword';
  private sort_type = 'created_at';
  private order_type = 'desc';
  private dist_opt = '';
  private elev_opt = '';


  /**
   * ルート情報モジュール
   */
  items: Array<RouteModel> = [];


  constructor(
    private http: HttpClient,
    public navCtrl: NavController,
    public popoverController: PopoverController,
    private location: Location,
  ) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    // URLのパラメーター処理
    let param = new URLSearchParams((new URL(window.location.href)).search);
    this.query = param.get('query') || '';
    this.query_type = param.get('mode');
    this.sort_type = param.get('sort_type');
    this.order_type = param.get('order_type');
    this.dist_opt = param.get('dist_opt');
    this.elev_opt = param.get('elev_opt');

    this.search();
  }

  changeURL() {
    // メンバ変数からURLパラメーターを積んで動的に変更する
    let param = '';
    if (this.query && this.query !== '') {
      param += 'query=' + this.query + '&';
    }
    if (this.query_type && this.query_type !== 'keyword') {
      param += 'mode=' + this.query_type + '&';
    }
    if (this.sort_type && this.sort_type !== 'created_at') {
      param += 'sort_type=' + this.sort_type + '&';
    }
    if (this.order_type && this.order_type !== 'desc') {
      param += 'order_type=' + this.order_type + '&';
    }
    if (this.dist_opt && this.dist_opt !== '') {
      param += 'dist_opt=' + this.dist_opt + '&';
    }
    if (this.elev_opt && this.elev_opt !== '') {
      param += 'elev_opt=' + this.elev_opt + '&';
    }
    //console.log(param);
    this.location.replaceState("/list", param);
  }

  /***
   * 設定メニュー
   */
  async presentSettingmenu(ev: any) {
    const popover = await this.popoverController.create({
      component: SearchSettingComponent,
      componentProps: {
        query: this.query,
        query_type: this.query_type,
        sort_type: this.sort_type,
        order_type: this.order_type,
        dist_opt: this.dist_opt,
        elev_opt: this.elev_opt,
      },
      event: ev,
      translucent: true,
      cssClass: 'search-settingmenu',
      mode: 'md',
    });
    await popover.present();
    popover.onDidDismiss().then(search_opt => {
      if (!search_opt.data) {
        return;
      }

      // 検索オプションデバッグはこれよ
      console.dir(search_opt);

      this.query = search_opt.data.query;
      this.query_type = search_opt.data.query_type;
      this.sort_type = search_opt.data.sort_type;
      this.order_type = search_opt.data.order_type;

      if (!search_opt.data.isDistDisabled) {
        this.dist_opt = search_opt.data.kmrange.lower + ':' + search_opt.data.kmrange.upper;
      } else {
        this.dist_opt = '';
      }

      if (!search_opt.data.isElevDisabled) {
        this.elev_opt = search_opt.data.elevrange.lower + ':' + search_opt.data.elevrange.upper;
      } else {
        this.elev_opt = '';
      }

      this.page = 1;
      this.items = [];
      this.search();
    });
  }

  wordChanged() {
    this.page = 1;
    this.items = [];
    this.search();
    this.infiniteScroll.disabled = false;
  }

  doInfinite(event) {
    this.page++;
    this.search();
  }

  pageSelected(item) {
    this.navCtrl.navigateForward('/watch/' + item.id);
  }

  authorSelected(item) {
    this.wordChanged();
    this.query = item.author;
    this.query_type = 'author';
    this.search();
  }

  private create_searchquery() {
    return this.search_url
      + '?q=' + this.q(this.query)
      + '&mode=' + this.q(this.query_type)
      + '&sort=' + this.q(this.sort_type)
      + '&order=' + this.q(this.order_type)
      + '&dist_opt=' + this.q(this.dist_opt)
      + '&elev_opt=' + this.q(this.elev_opt)
      + '&per_page=' + this.q(this.per_page)
      + '&page=' + this.q(this.page)
      ;
  }

  private q(query) {
    if (!query) {
      return '';
    }
    return query;

  }

  search(): Promise<any[]> {
    return this.http.get(this.create_searchquery()).toPromise()
      .then((res: any) => {
        this.changeURL();

        if (!res.results) {
          return;
        }

        if (res.results.length === 0) {
          this.infiniteScroll.disabled = true;
        }
        for (let i = 0; i < res.results.length; i++) {
          let r = new RouteModel();
          r.setData(res.results[i]);
          this.items.push(r);

          this.infiniteScroll.complete();
        }

        const response: any = res;
        return response;
      });
  }
}
