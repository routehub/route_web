import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

enum SearchQueryType {
  keyword = 'keyword',
  tag = 'tag',
  author = 'author',
}
enum SearchSortType {
  dist_asc = 'dist_asc',
  dist_desc = 'dist_desc',
  elevation_asc = 'elevation_asc',
  elevation_desc = 'elevation_desc',
  created_at_asc = 'created_at_asc',
  created_at_desc = 'created_at_desc',
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
  }
  elevrange = {
    upper: 1000,
    lower: 6000,
  }
  isDistDisabled = "true";
  isElevDisabled = "true";

  query: string;

  query_type: SearchQueryType = SearchQueryType.keyword;
  sort_type: SearchSortType = SearchSortType.created_at_desc;

  constructor(
    private popoverCtrl: PopoverController,
    navParams: NavParams,
  ) {
    this.query = navParams.get('query');
  }

  ngOnInit() {
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
      this.sort_type = SearchSortType.created_at_desc;
    } else {
      this.sort_type = event.detail.value;
    }
  }
}
