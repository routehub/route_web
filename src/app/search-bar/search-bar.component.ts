import { Component, OnInit } from '@angular/core';
import { MdcSliderChange } from '@angular-mdc/web';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

  onInput(event: MdcSliderChange): void {
    console.log(event.value);
  }

  onChange(event: MdcSliderChange): void {
    console.log(event.value);
  }
}
