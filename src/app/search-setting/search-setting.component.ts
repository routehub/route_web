import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

enum SearchQueryType {
  keyword = 'keyword',
  tag = 'tag',
  author = 'author',
}

@Component({
  selector: 'app-search-setting',
  templateUrl: './search-setting.component.html',
  styleUrls: ['./search-setting.component.scss'],
})

export class SearchSettingComponent implements OnInit {

  kmrange = {
    upper: 150,
    lower: 400,
  }
  elevrange = {
    upper: 1000,
    lower: 6000,
  }
  isDistDisabled = "true";
  isElevDisabled = "true";

  query: string;

  search_type: SearchQueryType;

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
    console.dir(this);
  }

  changeSearchType(event) {
    switch (event.detail.value) {
      case SearchQueryType.author:
        this.search_type = SearchQueryType.author;
        break;
      case SearchQueryType.tag:
        this.search_type = SearchQueryType.tag;
        break;
      default:
        this.search_type = SearchQueryType.keyword;
    }
  }

}
