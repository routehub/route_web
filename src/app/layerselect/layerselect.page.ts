import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layerselect',
  templateUrl: './layerselect.page.html',
  styleUrls: ['./layerselect.page.scss'],
})
export class LayerselectPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  changeLayer(index:number) {
    console.dir(index);
    var layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0];
    layerControlElement.getElementsByTagName('input')[index].click();
  }

}
