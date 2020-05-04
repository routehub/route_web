import { Component, OnInit } from '@angular/core'
import { PopoverController, NavParams } from '@ionic/angular'
/*
enum SearchQueryType {
  keyword = 'keyword',
  tag = 'tag',
  author = 'author',
}
enum SearchSortType {
  dist = 'dist',
  elevation = 'elevation',
  created_at = 'created_at',
}
*/
enum SearchSortOrder {
  asc = 'ASC',
  desc = 'DESC',
}
@Component({
  selector: 'app-search-setting',
  templateUrl: './search-setting.component.html',
  styleUrls: ['./search-setting.component.scss'],
})

export class SearchSettingComponent implements OnInit {
  queryTypes = [
    { id: 'keyword', kana: 'キーワード検索' },
    { id: 'author', kana: '作成名検索' },
    { id: 'tag', kana: 'タグ検索' },
  ];

  queryType;

  sortTypes = [
    { id: 'total_dist/DESC', kana: '距離順(降順)' },
    { id: 'total_dist/ASC', kana: '距離順(昇順) ' },
    { id: 'total_elevation/DESC', kana: '獲得標高順(降順)' },
    { id: 'total_elevation/ASC', kana: '獲得標高順(昇順)' },
    { id: 'created_at/DESC', kana: '作成日(降順)' },
    { id: 'created_at/ASC', kana: '作成日(昇順)' },
  ];

  sortType;


  kmrange = {
    upper: 400, // デフォルト値です
    lower: 150,
  };

  elevrange = {
    upper: 6000,
    lower: 200,
  };

  isDistDisabled = 'true';

  distIsChecked = false;

  isElevDisabled = 'true';

  elevationIsChecked = false;

  query: string;

  orderType: SearchSortOrder = SearchSortOrder.desc;

  sortkey: string;

  constructor(
    private popoverCtrl: PopoverController,
    private navParams: NavParams,
  ) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.query = this.navParams.get('query')


    const querytype = this.queryTypes.find((st) => (st.id === this.navParams.get('query_type')))
    this.queryType = querytype ? querytype.kana : this.queryTypes[0].kana


    const sorttype = this.sortTypes.find((st) => (st.id === `${this.navParams.get('sort_type')}/${this.navParams.get('order_type')}`))
    this.sortType = sorttype ? sorttype.kana : this.sortTypes[4].kana

    if (this.navParams.get('dist_opt')) {
      const distOpt = this.navParams.get('dist_opt').split(':')
      this.kmrange = {
        upper: distOpt[1],
        lower: distOpt[0],
      }
      this.isDistDisabled = 'false'
      this.distIsChecked = true
    }
    if (this.navParams.get('elev_opt')) {
      const elevOpt = this.navParams.get('elev_opt').split(':')
      this.kmrange = {
        upper: elevOpt[1],
        lower: elevOpt[0],
      }
      this.isElevDisabled = 'false'
      this.elevationIsChecked = true
    }
  }

  compareQueryType(o1, o2): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2
  }


  distCheckboxChanged(event) {
    if (event.detail.checked === true) {
      this.isDistDisabled = 'false'
    } else {
      this.isDistDisabled = 'true'
    }
  }

  elevCheckboxChanged(event) {
    if (event.detail.checked === true) {
      this.isElevDisabled = 'false'
    } else {
      this.isElevDisabled = 'true'
    }
  }

  search() {
    // 検索ロジックは元でヨロシクー
    const querytype = this.queryTypes.find((st) => (st.kana === this.queryType))
    const sort = this.sortTypes.find((st) => (st.kana === this.sortType))

    this.popoverCtrl.dismiss({
      query: this.query,
      query_type: querytype.id,
      sort_type: sort.id.split('/')[0],
      order_type: sort.id.split('/')[1],
      kmrange: this.kmrange,
      elevrange: this.elevrange,
      isDistDisabled: this.isDistDisabled === 'true',
      isElevDisabled: this.isElevDisabled === 'true',
    })
  }
  /*
    changeSearchType(event) {
      if (!event.detail.value) {
        //      this.query_type = SearchQueryType.keyword;
      } else {
        //      this.query_type = event.detail.value;
      }
    }

    changeSortType(event) {
      if (!event.detail.value) {
  //      this.sort_type = SearchSortType.created_at;
        this.order_type = SearchSortOrder.desc;
        this.sortkey = SearchSortType.created_at + '/' + SearchSortOrder.desc;
      } else {
        this.sort_type = event.detail.value.split('/')[0];
        this.order_type = event.detail.value.split('/')[1];
        this.sortkey = event.detail.value.split('/')[0] + '/' + event.detail.value.split('/')[1];
      }
      console.log(this.sortkey);
    }
    */
}
