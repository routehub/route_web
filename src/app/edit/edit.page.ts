import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  editMarkers = [];

  route_geojson = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": [],
        }
      },
    ],
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#0000ff",
      "line-width": 6,
      "line-opacity": 0.7,
    }
  };

  constructor(
    private http: HttpClient
  ) {
    this.routemap = new Routemap();

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let routemap = this.routemap.createMap(this.map_elem.nativeElement);
    this.map = routemap.map;
    this.elevation = routemap.elevation;
    console.dir(this.elevation);
    // デバッグ時にテンションを上げるためY!地図にする
    var layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0];
    layerControlElement.getElementsByTagName('input')[2].click();

    this.hammer = new Hammer(this.map_elem.nativeElement);
  }



  toggleCreateMode(event) {
    var that = this;
    event.stopPropagation();
    this.editMode = this.editMode ? false : true;

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

        let marker = L.marker(latlng, { icon: that.routemap.editIcon });
        that.editMarkers.push(marker);
        marker.addTo(that.map);
      });

      var route = [];
      this.hammer.on('panend', function (ev) {
        that.editMarkers.forEach(async function (marker, i) {
          if (i === 0) {
            return;
          }

          let start = that.editMarkers[i - 1]._latlng.lat + ',' + that.editMarkers[i - 1]._latlng.lng;
          let goal = marker._latlng.lat + ',' + marker._latlng.lng;

          await that.routing(start, goal).then(_route => {
            route = route.concat(_route);
            console.log(route.length);
          });

          if (i === that.editMarkers.length - 1) {
            that.route_geojson.features[0].geometry.coordinates = route;
            //            let elevation = route.filter(e => {return e[2]});
            L.geoJson(that.route_geojson, {
              "color": "#0000ff",
              "width": 6,
              "opacity": 0.7,
              onEachFeature: that.elevation.addData.bind(that.elevation)
            }).addTo(that.map);
          }
        });


      });


    } else {
      this.map.dragging.enable();
      this.hammer.off('pan');
      this.hammer.off('panend');
    }

  }


  async routing(start, goal) {
    let url = 'http://localhost:8080/route/1.0.0/routing?start=' + start + '&' + 'goal=' + goal;
    return await this.http.get(url).toPromise()
      .then((res: any) => {
        let ret = [];
        res.forEach(p => {
          ret.push([
            p[1],
            p[0],
            p[2],
          ]);
        })
        return ret;
      });
  }

}
