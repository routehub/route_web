import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  IonInfiniteScroll, NavController, PopoverController, LoadingController,
} from '@ionic/angular';
import { Location } from '@angular/common';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { SearchSettingComponent } from '../search-setting/search-setting.component';
import { environment } from '../../environments/environment';
import { RouteModel } from '../model/routemodel';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss'],
})
export class ListPage implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;

  loading = null

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
    public loadingCtrl: LoadingController,
    public popoverController: PopoverController,
    private location: Location,
    private apollo: Apollo,
  ) {
  }

  ngOnInit() {
  }

  changeTitle() {
    if (this.query !== '') {
      window.document.title = `"${this.query}"で検索 RouteHub`;
    } else {
      window.document.title = '検索 RouteHub(β)';
    }
  }

  ionViewWillEnter() {
    this.presentLoading();

    // URLのパラメーター処理
    const param = new URLSearchParams((new URL(window.location.href)).search);
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
      param += `query=${this.query}&`;
    }
    if (this.query_type && this.query_type !== 'keyword') {
      param += `mode=${this.query_type}&`;
    }
    if (this.sort_type && this.sort_type !== 'created_at') {
      param += `sort_type=${this.sort_type}&`;
    }
    if (this.order_type && this.order_type !== 'desc') {
      param += `order_type=${this.order_type}&`;
    }
    if (this.dist_opt && this.dist_opt !== '') {
      param += `dist_opt=${this.dist_opt}&`;
    }
    if (this.elev_opt && this.elev_opt !== '') {
      param += `elev_opt=${this.elev_opt}&`;
    }
    // console.log(param);
    this.location.replaceState('/', param);

    this.changeTitle();
  }

  /** *
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
    popover.onDidDismiss().then((search_opt) => {
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
        this.dist_opt = `${search_opt.data.kmrange.lower}:${search_opt.data.kmrange.upper}`;
      } else {
        this.dist_opt = '';
      }

      if (!search_opt.data.isElevDisabled) {
        this.elev_opt = `${search_opt.data.elevrange.lower}:${search_opt.data.elevrange.upper}`;
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
    this.navCtrl.navigateForward(`/watch/${item.id}`);
  }

  authorSelected(item) {
    this.wordChanged();
    this.query = item.author;
    this.query_type = 'author';
    this.search();
  }

  private q(query) {
    if (!query) {
      return '';
    }
    return query;
  }

  search() {
    const graphquery = gql`query PublicSearch($query: String, $author: String, $tag: String, $dist_from:Float, $dist_to: Float, $page: Float) {
      publicSearch(search: { query: $query, author: $author, tag: $tag, dist_from: $dist_from, dist_to: $dist_to, page: $page}) {
        id
        title
        body
        author
        total_dist
        max_elevation
        total_elevation
        created_at
        start_point
        goal_point
        summary
      }
    }`;
    this.apollo.query({

      query: graphquery,
      variables: {
        query: (this.query != '' && this.query_type === 'keyword') ? this.query : null,
        author: (this.query != '' && this.query_type === 'author')  ? this.query : null,
        tag: (this.query != '' && this.query_type === 'tag') ? this.query : null,
      
        dist_from: this.dist_opt.match(/\d+:\d+/) ? parseFloat(this.dist_opt.split(':')[0]) : null,
        dist_to: this.dist_opt.match(/\d+:\d+/) ? parseFloat(this.dist_opt.split(':')[1]) : null,


        /*
        sort: this.q(this.sort_type),
        order: this.q(this.order_type),
        elev_opt: this.q(this.elev_opt),
        per_page: this.q(this.per_page),
        */
        page: this.page,
      },
    }).subscribe(({ data }) => {
      this.dissmissLoading();

      const res: any = data;

      this.changeURL();

      if (!res.publicSearch) {
        return;
      }

      if (res.publicSearch.length === 0) {
        this.infiniteScroll.disabled = true;
      }

      for (let i = 0; i < res.publicSearch.length; i++) {
        const r = new RouteModel();
        r.setData(res.publicSearch[i]);
        this.items.push(r);

        this.infiniteScroll.complete();
      }

      const response: any = res.publicSearch;
      return response;
    });
  }

  async presentLoading() {
    if (this.loading) {
      return;
    }
    this.loading = await this.loadingCtrl.create({
      message: 'loading',
      duration: 3000,
    });
    // ローディング画面を表示
    await this.loading.present();
  }

  async dissmissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }
}
