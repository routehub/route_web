import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Routemap } from '../watch/routemap';
import * as Hammer from 'hammerjs';
import * as L from 'leaflet';

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
  hammer: any;

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

    this.hammer = new Hammer(this.map_elem.nativeElement);
  }

  toggleCreateMode(event) {
    var that = this;
    event.stopPropagation();
    this.editMode = this.editMode ? false : true;

    var editMarkers = [];

    if (this.editMode) {
      this.map.dragging.disable();

      var counter = 51;
      this.hammer.on('pan', function (ev) {
        if (counter < 50) {
          ++counter;
          return;
        }
        counter = 0;
        let _point = L.point(ev.center.x, ev.center.y);
        let latlng = that.map.layerPointToLatLng(_point);
        console.log(latlng);
        let marker = L.marker(latlng, { icon: that.routemap.editIcon });
        editMarkers.push(marker);
        marker.addTo(that.map);


      });



    } else {
      this.map.dragging.enable();
      this.hammer.off('pan');
    }

  }

}
