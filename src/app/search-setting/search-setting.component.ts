import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

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

  constructor(private popoverCtrl: PopoverController) { }

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

}
