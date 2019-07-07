import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Routemap } from '../watch/routemap';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  @ViewChild('map') map_elem: ElementRef;
  map: any;
  routemap: Routemap;
  elevation: any;
  editMode: boolean = false;

  constructor() {
    this.routemap = new Routemap();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let routemap = this.routemap.createMap(this.map_elem.nativeElement);
    this.map = routemap.map;
    this.elevation = routemap.elevation;

    // デバッグ時にテンションを上げるためY!地図にする
    var layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0];
    layerControlElement.getElementsByTagName('input')[2].click();

  }

  toggleCreateMode(event) {
    event.stopPropagation();
    this.editMode = this.editMode ? false : true;
    if (this.editMode) {
      this.map.dragging.disable();


    } else {
      this.map.dragging.enable();


    }

  }

}
