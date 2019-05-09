import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

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
enum SearchSortOrder {
  asc = 'asc',
  desc = 'desc',
}
@Component({
  selector: 'app-search-setting',
  templateUrl: './search-setting.component.html',
  styleUrls: ['./search-setting.component.scss'],
})

export class SearchSettingComponent implements OnInit {

  kmrange = {
    upper: 150, // デフォルト値です
    lower: 400,
  };
  elevrange = {
    upper: 1000,
    lower: 6000,
  };
  isDistDisabled = "true";
  isElevDisabled = "true";

  query: string;

  query_type: SearchQueryType = SearchQueryType.keyword;
  sort_type: SearchSortType = SearchSortType.created_at;
  order_type: SearchSortOrder = SearchSortOrder.desc;

  constructor(
    private popoverCtrl: PopoverController,
    private navParams: NavParams,
  ) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    console.dir(this.navParams);
    this.query = this.navParams.get('query');
    this.query_type = this.navParams.get('query_type');
    this.sort_type = this.navParams.get('sort_type');
    this.order_type = this.navParams.get('order_type');
    if (this.navParams.get('dist_opt')) {
      let dist_opt = this.navParams.get('dist_opt').split(':');
      this.kmrange = {
        upper : dist_opt[0],
        lower : dist_opt[1],
      };
    }
    if (this.navParams.get('elev_opt')) {
      let elev_opt = this.navParams.get('elev_opt').split(':');
      this.kmrange = {
        upper : elev_opt[0],
        lower : elev_opt[1],
      };
    }
  }


  distCheckboxChanged(event) {
    if (event.detail.checked === true) {
      this.isDistDisabled = "false";
    } else {
      this.isDistDisabled = "true";
    }
  }
  elevCheckboxChanged(event) {
    if (event.detail.checked === true) {
      this.isElevDisabled = "false";
    } else {
      this.isElevDisabled = "true";
    }
  }

  search() {
    // 検索ロジックは元でヨロシクー
    this.popoverCtrl.dismiss({
      query: this.query,
      query_type: this.query_type,
      sort_type: this.sort_type,
      order_type: this.order_type,
      kmrange: this.kmrange,
      elevrange: this.elevrange,
      isDistDisabled: this.isDistDisabled === 'true' ? true : false,
      isElevDisabled: this.isElevDisabled === 'true' ? true : false,
    });
  }

  changeSearchType(event) {
    if (!event.detail.value) {
      this.query_type = SearchQueryType.keyword;
    } else {
      this.query_type = event.detail.value;
    }
  }

  changeSortType(event) {
    if (!event.detail.value) {
      this.sort_type = SearchSortType.created_at;
      this.order_type = SearchSortOrder.desc;
    } else {
      this.sort_type = event.detail.value.split('/')[0];
      this.order_type = event.detail.value.split('/')[1];
    }
  }
}
