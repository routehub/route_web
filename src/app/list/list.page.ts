import { Component, OnInit, ViewChild } from '@angular/core'
import {
  IonInfiniteScroll, NavController, PopoverController, LoadingController, Platform,
} from '@ionic/angular'
import { Location } from '@angular/common'
import gql from 'graphql-tag'
import { Apollo } from 'apollo-angular'
import { SearchSettingComponent } from '../search-setting/search-setting.component'
import { RouteModel } from '../model/routemodel'
import { AuthService } from '../auth.service'

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss'],
})
export class ListPage implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;

  @ViewChild('logoutButton', { static: false }) logoutButton: any;

  @ViewChild('loginButton', { static: false }) loginButton: any;

  showSearchHeader: boolean = false;

  showTitlePane: boolean = true;

  loading = null

  /**
   * 検索用パラメーター
   */
  private page = 1;

  // private per_page = 6;

  public query = ''; // viewとも共通

  private queryType = 'keyword';

  private sortType = 'created_at';

  private orderType = 'DESC';

  private distOpt = '';

  private elevOpt = '';


  /**
   * ルート情報モジュール
   */
  items: Array<RouteModel> = [];


  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public popoverController: PopoverController,
    public platform: Platform,
    private location: Location,
    private apollo: Apollo,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
  }

  changeTitle() {
    if (this.query !== '') {
      window.document.title = `"${this.query}"で検索 RouteHub`
    } else {
      window.document.title = '検索 RouteHub(β)'
    }
  }

  ionViewWillEnter() {
    this.presentLoading()

    // URLのパラメーター処理
    const param = new URLSearchParams((new URL(window.location.href)).search)
    this.query = param.get('query') || ''
    this.queryType = param.get('mode') || 'keyword'
    this.sortType = param.get('sort_type')
    this.orderType = param.get('order_type')
    this.distOpt = param.get('dist_opt')
    this.elevOpt = param.get('elev_opt')

    this.search()

    // ログインユーザーを取得
    if (this.platform.is('mobile')) {
      if (!this.authService.currentLoginUser) {
        this.loginButton.el.style.display = 'none'
      } else {
        this.logoutButton.el.style.display = 'block'
        this.logoutButton.el.style.color = '#ffffff9c'
        this.logoutButton.el.style.background = '#ffffffa6'
      }
    }
  }

  changeURL() {
    // メンバ変数からURLパラメーターを積んで動的に変更する
    let param = ''
    if (this.query && this.query !== '') {
      param += `query=${this.query}&`
    }
    if (this.queryType && this.queryType !== 'keyword') {
      param += `mode=${this.queryType}&`
    }
    if (this.sortType && this.sortType !== 'created_at') {
      param += `sort_type=${this.sortType}&`
    }
    if (this.orderType && this.orderType !== 'DESC') {
      param += `order_type=${this.orderType}&`
    }
    if (this.distOpt && this.distOpt !== '') {
      param += `dist_opt=${this.distOpt}&`
    }
    if (this.elevOpt && this.elevOpt !== '') {
      param += `elev_opt=${this.elevOpt}&`
    }
    // console.log(param);
    this.location.replaceState('/', param)

    this.changeTitle()
  }

  /** *
   * 設定メニュー
   */
  async presentSettingmenu(ev: any) {
    const popover = await this.popoverController.create({
      component: SearchSettingComponent,
      componentProps: {
        query: this.query,
        query_type: this.queryType,
        sort_type: this.sortType,
        order_type: this.orderType,
        dist_opt: this.distOpt,
        elev_opt: this.elevOpt,
      },
      event: ev,
      translucent: true,
      cssClass: 'search-settingmenu',
      mode: 'md',
    })
    await popover.present()
    popover.onDidDismiss().then((searchOpt) => {
      if (!searchOpt.data) {
        return
      }

      // 検索オプションデバッグはこれよ
      // console.dir(searchOpt)

      this.query = searchOpt.data.query
      this.queryType = searchOpt.data.query_type
      this.sortType = searchOpt.data.sort_type
      this.orderType = searchOpt.data.order_type

      if (!searchOpt.data.isDistDisabled) {
        this.distOpt = `${searchOpt.data.kmrange.lower}:${searchOpt.data.kmrange.upper}`
      } else {
        this.distOpt = ''
      }

      if (!searchOpt.data.isElevDisabled) {
        this.elevOpt = `${searchOpt.data.elevrange.lower}:${searchOpt.data.elevrange.upper}`
      } else {
        this.elevOpt = ''
      }

      this.page = 1
      this.items = []
      this.search()
    })
  }

  wordChanged() {
    this.page = 1
    this.items = []
    this.search()
    this.infiniteScroll.disabled = false
  }

  doInfinite(event) { // eslint-disable-line
    this.page++
    this.search()
  }

  pageSelected(item) {
    this.navCtrl.navigateForward(`/watch/${item.id}`)
  }

  authorSelected(item) {
    this.wordChanged()
    this.query = item.author
    this.queryType = 'author'
    this.search()
  }

  /*
    private q(query) {
      if (!query) {
        return ''
      }
      return query
    }
  */
  search() {
    const graphquery = gql`query PublicSearch($query: String, $author: String, $tag: String, $dist_from:Float, $dist_to: Float, $elevation_from: Float, $elevation_to: Float, $sort_key: String, $sort_order: String$page: Float) {
      publicSearch(search: { query: $query, author: $author, tag: $tag, dist_from: $dist_from, dist_to: $dist_to, elevation_from: $elevation_from, elevation_to : $elevation_to, sort_key: $sort_key, sort_order: $sort_order,  page: $page}) {
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
    }`

    this.apollo.query({

      query: graphquery,
      variables: {
        query: (this.query !== '' && this.queryType === 'keyword') ? this.query : null,
        author: (this.query !== '' && this.queryType === 'author') ? this.query : null,
        tag: (this.query !== '' && this.queryType === 'tag') ? this.query : null,

        dist_from: (this.distOpt != null && this.distOpt.match(/\d+:\d+/)) ? parseFloat(this.distOpt.split(':')[0]) : null,
        dist_to: (this.distOpt != null && this.distOpt.match(/\d+:\d+/)) ? parseFloat(this.distOpt.split(':')[1]) : null,

        elevation_from: (this.elevOpt != null && this.elevOpt.match(/\d+:\d+/)) ? parseFloat(this.elevOpt.split(':')[0]) : null,
        elevation_to: (this.elevOpt != null && this.elevOpt.match(/\d+:\d+/)) ? parseFloat(this.elevOpt.split(':')[1]) : null,

        sort_key: this.sortType,
        sort_order: this.orderType,
        page: this.page,
      },
    }).subscribe(({ data }) => {
      // タイトルの表示表示切り替え
      this.showTitlePane = this.query === ''
      if (!this.showTitlePane) {
        this.showSearchHeader = true
      }


      this.dissmissLoading()

      const res: any = data

      this.changeURL()

      if (!res.publicSearch) {
        return
      }

      if (res.publicSearch.length === 0) {
        this.infiniteScroll.disabled = true
      }

      for (let i = 0; i < res.publicSearch.length; i++) {
        const r = new RouteModel()
        r.setData(res.publicSearch[i])
        this.items.push(r)

        this.infiniteScroll.complete()
      }

      const response: any = res.publicSearch
      return response
    })
  }

  async presentLoading() {
    if (this.loading) {
      return
    }
    this.loading = await this.loadingCtrl.create({
      message: 'loading',
      duration: 3000,
    })
    // ローディング画面を表示
    await this.loading.present()
  }

  async dissmissLoading() {
    if (this.loading) {
      await this.loading.dismiss()
    }
  }

  logScrolling(event) {
    if (!this.showTitlePane) {
      this.showSearchHeader = true
      return
    }
    if (event.detail.scrollTop > 300) {
      this.showSearchHeader = true
    } else {
      this.showSearchHeader = false
    }
  }
}
