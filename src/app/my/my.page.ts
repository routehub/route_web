import { Component, OnInit } from '@angular/core'
import { Platform, NavController, LoadingController } from '@ionic/angular'
import 'firebase/auth'
import gql from 'graphql-tag'
import { Apollo } from 'apollo-angular'
import { AngularFireAuth } from 'angularfire2/auth'
import { RouteModel } from '../model/routemodel'
import { environment } from '../../environments/environment'
import { Events } from '../Events'
import { AuthService } from '../auth.service'

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss', '../list/list.page.scss'],
})
export class MyPage implements OnInit {
  loading = null

  currentLoginUser: firebase.User

  displayName: string;

  isMyRoute: Boolean;

  items: Array<RouteModel> = [];

  constructor(
    private navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private authService: AuthService,
    public events: Events,
    public platform: Platform,
    private apollo: Apollo,
    private angularFireAuth: AngularFireAuth,
  ) { }

  ngOnInit() { }

  /**
   * 公開非公開切り替えのイベントハンドラ
   * @param item
   */
  togglePrivate(item) {
    // UI変更
    item.isPrivate = !item.isPrivate // eslint-disable-line
    item.isPrivateJa = item.isPrivate ? '非公開' : '公開' // eslint-disable-line

    const graphquery = gql`mutation ChangePrivateStatus($id: String!, $is_private: Boolean!) {
        changePrivateStatus(id: $id, is_private : $is_private) { 
          id,
          is_private
        } 
    }`
    this.apollo.mutate({
      mutation: graphquery,
      variables: {
        id: item.id,
        is_private: item.is_private,
      },
    }).subscribe(({ data }) => { }) // eslint-disable-line
  }

  /**
   * ルート削除のイベントハンドラ
   * @param item
   */
  delete(item) {
    if (!window.confirm('もとに戻せません。本当に削除しますか？')) { // eslint-disable-line
      return
    }

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].id === item.id) {
        // UIから削除
        this.items.splice(i, 1)
        // DBから削除
        this.deleteRoute(item.id)
      }
    }
  }

  /**
   * ルートの削除
   * @param id
   */
  private deleteRoute(id) {
    const graphquery = gql`mutation deleteRoute($ids: [String!]!) {
        deleteRoute(ids: $ids) { 
          id
        } 
        }`
    this.apollo.mutate({
      mutation: graphquery,
      variables: { ids: [id] },
    }).subscribe(({ data }) => {
      console.dir(data) // eslint-disable-line
    })
  }

  showMyRoute() {
    this.isMyRoute = true
    this.items = []
    // update順ではなくcreate順
    const graphquery = gql`query PrivateSearch($page: Float) {
      privateSearch(search: { page: $page, sort_key: "created_at"}) {
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
        is_private
      }
    }`
    this.getMyLikeRoute(graphquery)
  }

  showLikeRoute() {
    this.isMyRoute = false
    this.items = []
    const graphquery = gql`query GetLikeSesrch($page: Float) {
      getLikeSesrch(search: { page: $page}) {
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
        is_private
      }
    }`
    this.getMyLikeRoute(graphquery)
  }

  ionViewWillEnter() {
    this.angularFireAuth.authState.subscribe((u) => {
      this.currentLoginUser = u
      if (!u) {
        this.navCtrl.navigateRoot('/')
      }
      this.showMyRoute()
    })

    window.document.title = 'マイページ RouteHub(β)'

    // 表示用ユーザー名を取得
    const graphquery = gql`{
      getUser { 
        display_name
      } 
    }`
    this.apollo.query({
      query: graphquery,
    }).subscribe(({ data }) => {
      const loginData: any = data
      this.displayName = loginData.getUser.display_name
    })
  }

  pageSelected(item) {
    this.navCtrl.navigateForward(`/watch/${item.id}`)
  }

  /**
   * ユーザー名変更
   */
  displayNameChanged() {
    const graphquery = gql`mutation SaveUser($display_name: String!) {
        saveUser(display_name: $display_name) { 
          display_name
        } 
        }`
    this.apollo.mutate({
      mutation: graphquery,
      variables: { display_name: this.displayName },
    }).subscribe(({ data }) => { }) // eslint-disable-line
  }

  /**
   * My, お気に入りルート表示
   * @param graphquery
   */
  async getMyLikeRoute(graphquery) {
    this.presentLoading()

    this.apollo.query({
      query: graphquery,
      variables: {
        page: 1,
      },
      fetchPolicy: 'no-cache',
    }).subscribe(({ data }) => {
      this.dissmissLoading()

      const likeData: any = data
      const res: any = likeData.privateSearch ? likeData.privateSearch : likeData.getLikeSesrch

      if (!res) {
        return
      }
      for (let i = 0; i < res.length; i++) {
        const r = new RouteModel()
        r.setData(res[i])
        this.items.push(r)
      }

      const response: any = res
      return response
    })
  }

  private getThumbUrl(summary) {
    const line = summary.slice(11, -1).split(',').map((pos) => {
      const p = pos.split(' ')
      return `${p[1]},${p[0]}`
    }).join(',')
    return `${environment.api.staticmap_url}?appid=${environment.api.thumbappid}&autoscale=on&scalebar=off&width=450&height=300&l=` + `0,0,255,105,4,${line}` // eslint-disable-line
  }

  logout() {
    this.events.publish('user:logout', {})
    window.location.reload()
  }


  async presentLoading() {
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
}
