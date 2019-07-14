import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Routemap } from '../watch/routemap';
import * as Hammer from 'hammerjs';
import * as L from 'leaflet';
import { async } from '@angular/core/testing';

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
  geojson: any;
  private hotlineLayer: any;
  private isSlopeMode = false;
  private line: any;
  private _routemap: any;

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
    this.line = [];

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let routemap = this._routemap = this.routemap.createMap(this.map_elem.nativeElement);
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
      // this.map.dragging.disable();
      this.map.dragging.enable();

      // var counter = 51;
      // this.hammer.on('pan', function (ev) {
      //   if (counter < 50) {
      //     ++counter;
      //     return;
      //   }
      //   counter = 0;
      //   let _point = L.point(ev.center.x, ev.center.y);
      //   let latlng = that.map.containerPointToLatLng(_point);

      //   let marker = L.marker(latlng, { icon: that.routemap.editIcon });
      //   that.editMarkers.push(marker);
      //   marker.addTo(that.map);
      // });

      // var route = [];
      // this.hammer.on('panend', function (ev) {
      //   that.editMarkers.forEach(async function (marker, i) {
      //     if (i === 0) {
      //       return;
      //     }

      //     let start = that.editMarkers[i - 1]._latlng.lat + ',' + that.editMarkers[i - 1]._latlng.lng;
      //     let goal = marker._latlng.lat + ',' + marker._latlng.lng;

      //     await that.routing(start, goal).then(_route => {
      //       route = route.concat(_route);
      //       console.log(route.length);
      //     });

      //     if (i === that.editMarkers.length - 1) {
      //       that.route_geojson.features[0].geometry.coordinates = that.line = route;
      //       //            let elevation = route.filter(e => {return e[2]});
      //       L.geoJson(that.route_geojson, {
      //         "color": "#0000ff",
      //         "width": 6,
      //         "opacity": 0.7,
      //         onEachFeature: that.elevation.addData.bind(that.elevation)
      //       }).addTo(that.map);

      //     }
      //   });


      // });

      this.hammer.on('tap', function(ev)
      {
        let header_height = 64;
        let _point = L.point(ev.center.x, ev.center.y - header_height);
        let latlng = that.map.containerPointToLatLng(_point);

        let overlap_marker = that.find_nearest_marker_from_point( _point, 16.0 );
        if ( overlap_marker != null )
        {
          return;
        }

        let marker_data = L.marker(latlng, { icon: that.routemap.editIcon, draggable: true });
        that.editMarkers.push(marker_data);
        
        marker_data.addTo(that.map);

        marker_data.on('dragend', function(e)
        {
          console.log("dragend");
          this.move_marker( e.target._latlng );
        });

        marker_data.on('click', function(e)
        {
          console.log("click");
          this.remove_marker();
        });

        marker_data.routing = async function()
        {
          if ( this.next_data != null )
          {
            let start = this._latlng.lat + ',' + this._latlng.lng;
            let goal = this.next_data._latlng.lat + ',' + this.next_data._latlng.lng;

            await that.routing(start, goal).then(_route =>
            {
              marker_data.route = _route;
            });
          }
          else
          {
            marker_data.route = [];
          }
        };

        marker_data.move_marker = function( a_latlng )
        {
          this.setLatLng( a_latlng );

          this.routing().then( res =>
          {
            if ( this.prev_data != null )
            {
              this.prev_data.routing().then( res =>
              {
                that.refresh_route();
              });
            }
            else
            {
              that.refresh_route();
            }
          });
        };

        marker_data.remove_marker = function()
        {
          let prev = this.prev_data;
          let next = this.next_data;
      
          if ( prev != null )
          {
            prev.next_data = next;
          }
          if ( next != null )
          {
            next.prev_data = prev;
          }
      
          this.removeFrom( that.map );
      
          for ( let n = 0 ; n < that.editMarkers.length ; ++n )
          {
            if ( that.editMarkers[n] !== this )
            {
              continue;
            }
      
            that.editMarkers.splice( n, 1 );          
            break;
          }
      
          if ( prev != null )
          {
            prev.routing().then ( res =>
            {
              that.refresh_route();
            });
          }
          else if ( next != null )
          {
            next.routing().then ( res =>
            {
              that.refresh_route();
            });
          }
          else
          {
            that.refresh_route();
          }
        };

        if ( that.editMarkers.length >= 2 )
        {
          let start_data = that.editMarkers[that.editMarkers.length - 2];
          let goal_data = that.editMarkers[that.editMarkers.length - 1];

          start_data.next_data = goal_data;
          goal_data.prev_data = start_data;

          start_data.routing().then( res =>
          {
            that.line = that.line.concat(start_data.route);
            console.log(that.line.length);

            that.refresh_geojson();
          });
        }
      });



    } else {
      this.map.dragging.enable();
      this.hammer.off('pan');
      this.hammer.off('panend');
    }

  }

  find_nearest_marker_from_point( a_point, a_distance )
  {
    let that = this;
    let dist2 = a_distance * a_distance;

    let res = null;
    let min_dist = 0.0;

    for ( let n = 0 ; n < that.editMarkers.length ; ++n )
    {
      let mark = that.editMarkers[n];
      let point = that.map.latLngToContainerPoint( mark._latlng );

      let delta_x = point.x - a_point.x;
      let delta_y = point.y - a_point.y;

      let dist = delta_x * delta_x + delta_y * delta_y;
      // console.log("dist: ", Math.sqrt( dist ) );

      if ( dist > dist2 )
      {
        continue;
      }

      if ( ( res != null ) && ( dist >= min_dist ) )
      {
        continue;
      }

      res = mark;
      min_dist = dist;
    }

    return res;
  }

  remove_geojson()
  {
    let that = this;

    if ( that.geojson != null )
    {
      that.geojson.removeFrom(that.map);
      that.geojson = null;
    }
  }

  refresh_geojson()
  {
    let that = this;

    that.remove_geojson();

    that.route_geojson.features[0].geometry.coordinates = that.line;
    that.geojson = L.geoJson(that.route_geojson, {
      "color": "#0000ff",
      "width": 6,
      "opacity": 0.7,
      // onEachFeature: that.elevation.addData.bind(that.elevation)
    });

    that.geojson.addTo(that.map);

    // that.geojson.features[0].geometry.on('click', function(e)
    // {
    //   console.log("on click geometry");
    // });
    // that.geojson.on('click', function(e)
    // {
    //   console.log("on click geojson");
    // });
  }

  refresh_route()
  {
    let that = this;

    that.line = [];
    for ( let i = 0 ; i < that.editMarkers.length - 1 ; ++i )
    {
      // console.log(that.editMarkers[i].route.length);
      that.line = that.line.concat(that.editMarkers[i].route);
    }

    that.refresh_geojson();
  }

  async routing(start, goal) {
    // let url = 'http://localhost:8080/route/1.0.0/routing?start=' + start + '&' + 'goal=' + goal;
    let url = 'https://routing.routehub.app/route/1.0.0/routing?start=' + start + '&' + 'goal=' + goal;
    return await this.http.get(url).toPromise()
      .then((res: any) => {
        let ret = [];
        res.forEach(p => {
          ret.push([
            p[1],
            p[0],
            p[2],
          ]);
        });
        return ret;
      });
  }




  toggleSlopeLayer(event) {
    event.stopPropagation();
    if (!this.hotlineLayer && !this.isSlopeMode) {
      this.hotlineLayer = this._routemap.addElevationHotlineLayer(this.line);
      //      this.presentToast('標高グラデーションモードに変更');
    } else if (this.hotlineLayer && !this.isSlopeMode) {
      this.map.removeLayer(this.hotlineLayer);
      this.hotlineLayer = this._routemap.addSlopeHotlineLayer(this.line);
      //      this.presentToast('斜度グラデーションモードに変更');
      this.isSlopeMode = true;
    } else {
      this.map.removeLayer(this.hotlineLayer);
      this.hotlineLayer = false;
      this.isSlopeMode = false;
    }
  }
}
