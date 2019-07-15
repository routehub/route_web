import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ToastController } from '@ionic/angular';
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
  editMode = false;
  hammer: any;
  editMarkers = [];
  geojson: L.geoJSON;
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
    private http: HttpClient,
    public toastController: ToastController
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

    // デバッグ時にテンションを上げるためY!地図にする
    //let layerControlElement = document.getElementsByClassName('leaflet-control-layers')[0];
    //layerControlElement.getElementsByTagName('input')[2].click();

    // 見やすくするために最初からメニューを開いておく
    document.getElementById('menuButton').click();

    this.hammer = new Hammer(this.map_elem.nativeElement);
  }



  toggleCreateMode(event) {
    let that = this;
    event.stopPropagation();
    this.editMode = this.editMode ? false : true;

    if (this.editMode) {
      // TODO : SP用の動作をまた実装する(hammer panが便利)
      this.presentToast('ルート編集モードに変更');

      that.hammer.on('tap', function(ev)
      {
        let header_height = 64;
        let _point = L.point(ev.center.x, ev.center.y - header_height);
        let latlng = that.map.containerPointToLatLng(_point);

        let overlap_marker = that.find_nearest_marker_from_latlng( latlng, 16.0 );
        if ( overlap_marker != null )
        {
          return;
        }

        let marker = L.marker(latlng, { icon: that.routemap.editIcon, draggable: true });
        let marker_data = new MarkerData( that, marker );
        
        marker.on('dragend', function(e)
        {
          console.log("dragend");
          marker_data.move_marker( e.target._latlng );
        });

        marker.on('click', function(e)
        {
          console.log("click");
          marker_data.remove_marker();
        });

        // 経由点追加テスト
        let overlap_route = that.find_nearest_route_point_from_latlng( latlng, 16.0 );
        if ( overlap_route == null )
        {
          that.push_marker( marker_data );
        }
        else
        {
          that.insert_marker( marker_data, overlap_route.next_data );
        }
      });



    } else {
      this.presentToast('ルート表示モードに変更');
      this.hammer.off('tap');
    }

  }

  find_nearest_marker_from_latlng( a_latlng, a_distance: number )
  {
    let that = this;
    let latlng_point = that.map.latLngToContainerPoint( a_latlng );
    let dist2 = a_distance * a_distance;

    let res = null;
    let min_dist = 0.0;

    for ( let i = 0 ; i < that.editMarkers.length ; ++i )
    {
      let mark = that.editMarkers[i];
      let point = that.map.latLngToContainerPoint( mark.marker._latlng );

      let delta_x = point.x - latlng_point.x;
      let delta_y = point.y - latlng_point.y;

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

  find_nearest_route_point_from_latlng( a_latlng, a_distance: number )
  {
    let that = this;
    let latlng_point = that.map.latLngToContainerPoint( a_latlng );
    let dist2 = a_distance * a_distance;

    let res = null;
    let min_dist = 0.0;

    for ( let i = 0 ; i < that.editMarkers.length ; ++i )
    {
      let mark = that.editMarkers[i];

      if ( mark.bounds == null )
      {
        continue;
      }

      if ( !mark.bounds.contains( a_latlng ) )
      {
        continue;
      }

      let route = mark.route;

      for ( let j = 0 ; j < route.length ; ++j )
      {
        // let point = that.map.latLngToContainerPoint( route[j] );
        let latlng = L.latLng( route[j][1], route[j][0] );
        let point = that.map.latLngToContainerPoint( latlng );

        let delta_x = point.x - latlng_point.x;
        let delta_y = point.y - latlng_point.y;
  
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

    that.elevation.clear();
    that.geojson = L.geoJson(that.route_geojson, {
      "color": "#0000ff",
      "width": 6,
      "opacity": 0.7,
      onEachFeature: that.elevation.addData.bind(that.elevation)
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

  push_marker( a_markar_data: MarkerData )
  {
    let that = this;

    a_markar_data.marker.addTo( that.map );

    that.editMarkers.push( a_markar_data );

    if ( that.editMarkers.length >= 2 )
    {
      let start_data = that.editMarkers[that.editMarkers.length - 2];
      let goal_data = that.editMarkers[that.editMarkers.length - 1];

      start_data.set_next( goal_data );

      start_data.routing().then( () =>
      {
        that.line = that.line.concat(start_data.route);        
        console.log(that.line.length);

        that.refresh_geojson();
      });
    }
  }

  insert_marker( a_markar_data: MarkerData, a_position: MarkerData )
  {
    let that = this;

    a_markar_data.marker.addTo( that.map );

    for ( let i = 0 ; i < that.editMarkers.length ; ++i )
    {
      if ( that.editMarkers[i] !== a_position )
      {
        continue;
      }

      let prev = that.editMarkers[i].prev_data;
      let next = that.editMarkers[i];

      let last = that.editMarkers.splice( i, that.editMarkers.length - i);
      that.editMarkers.push( a_markar_data );
      that.editMarkers = that.editMarkers.concat( last );

      a_markar_data.set_next( next );
      a_markar_data.set_prev( prev );

      a_markar_data.refresh_marker();
      break;
    }
  }

  remove_markar( a_markar_data: MarkerData )
  {
    let that = this;

    a_markar_data.marker.removeFrom( that.map );

    for ( let n = 0 ; n < that.editMarkers.length ; ++n )
    {
      if ( that.editMarkers[n] !== a_markar_data )
      {
        continue;
      }

      that.editMarkers.splice( n, 1 );
      break;
    }
  }


  async routing(start, goal)
  {
    // let url = 'http://localhost:8080/route/1.0.0/routing?start=' + start + '&' + 'goal=' + goal;
    let url = 'https://routing.routehub.app/route/1.0.0/routing?start=' + start + '&' + 'goal=' + goal;
    return await this.http.get(url).toPromise().then( (res: any) =>
    {
      let ret = [];

      res.forEach( (p: any) =>
      {
        ret.push( [ p[1], p[0], p[2], ] );
      });

      return ret;
    });
  }




  toggleSlopeLayer(event) {
    event.stopPropagation();
    if (!this.hotlineLayer && !this.isSlopeMode) {
      this.hotlineLayer = this._routemap.addElevationHotlineLayer(this.line);
      this.presentToast('標高グラデーションモードに変更');
    } else if (this.hotlineLayer && !this.isSlopeMode) {
      this.map.removeLayer(this.hotlineLayer);
      this.hotlineLayer = this._routemap.addSlopeHotlineLayer(this.line);
      this.presentToast('斜度グラデーションモードに変更');
      this.isSlopeMode = true;
    } else {
      this.map.removeLayer(this.hotlineLayer);
      this.hotlineLayer = false;
      this.isSlopeMode = false;
    }
  }

  async presentToast(message)
  {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: "primary",
    });
    toast.present();
  }
}





class MarkerData
{
  marker: L.marker;
  next_data: MarkerData;
  prev_data: MarkerData;
  route = [];
  bounds: L.latLngBounds;

  constructor( private edit_page: EditPage, a_marker: L.markar )
  {
    this.marker = a_marker;
  }

  set_next( a_next_data: MarkerData )
  {
    let that = this;

    that.next_data = a_next_data;
    if ( a_next_data != null )
    {
      a_next_data.prev_data = that;
    }
  }

  set_prev( a_prev_data: MarkerData )
  {
    let that = this;

    that.prev_data = a_prev_data;
    if ( a_prev_data != null )
    {
      a_prev_data.next_data = that;
    }
  }

  async routing()
  {
    let that = this;

    if ( that.next_data != null )
    {
      let start = that.marker._latlng.lat + ',' + that.marker._latlng.lng;
      let goal = that.next_data.marker._latlng.lat + ',' + that.next_data.marker._latlng.lng;

      await that.edit_page.routing(start, goal).then( (_route: any) =>
      {
        that.route = _route;

        if ( _route.length > 0 )
        {
          let latlng_min = L.latLng( _route[0][1], _route[0][0] );
          let latlng_max = L.latLng( _route[0][1], _route[0][0] );

          for ( let i = 1 ; i < _route.length ; ++i )
          {
            latlng_max.lat = Math.max( latlng_max.lat, _route[i][1] );
            latlng_max.lng = Math.max( latlng_max.lng, _route[i][0] );

            latlng_min.lat = Math.min( latlng_min.lat, _route[i][1] );
            latlng_min.lng = Math.min( latlng_min.lng, _route[i][0] );
          }

          that.bounds = L.latLngBounds( latlng_min, latlng_max );
        }
        else
        {
          that.bounds = null;
        }
      });
    }
    else
    {
      that.route = [];
      that.bounds = null;
    }
  }

  refresh_marker()
  {
    let that = this;

    that.routing().then( () =>
    {
      if ( that.prev_data != null )
      {
        that.prev_data.routing().then( () =>
        {
          that.edit_page.refresh_route();
        });
      }
      else
      {
        that.edit_page.refresh_route();
      }
    });
  }

  move_marker( a_latlng: L.latLng )
  {
    let that = this;

    that.marker.setLatLng( a_latlng );

    that.refresh_marker();
  }

  remove_marker()
  {
    let that = this;

    let prev = that.prev_data;
    let next = that.next_data;

    if ( prev != null )
    {
      prev.set_next( next );
    }
    if ( next != null )
    {
      next.set_prev( prev );
    }

    that.edit_page.remove_markar( that );

    if ( prev != null )
    {
      prev.routing().then ( () =>
      {
        that.edit_page.refresh_route();
      });
    }
    else if ( next != null )
    {
      next.routing().then ( () =>
      {
        that.edit_page.refresh_route();
      });
    }
    else
    {
      that.edit_page.refresh_route();
    }
  }
}
