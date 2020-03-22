import * as mapboxgl from 'mapbox-gl';

export interface Options {
  marker: mapboxgl.Marker;
}
/* eslint-disable class-methods-use-this */
export default class MapboxAnimatedMarker {
  private tid: number | null = null;
  private currentMarker: mapboxgl.Marker | null = null;
  private i = 0;

  constructor(private map: mapboxgl.Map, private linePoints: mapboxgl.LngLat[], private options?: Options) {
  }

  public start() {
    console.log(this.linePoints.length);

    this.animate();
  }

  public stop() {
    if (this.tid) {
      window.clearInterval(this.tid);
    }
  }

  public reset() {
    stop();
    this.i = 0;
  }

  private animate() {
    // setup the viewport
    this.map.jumpTo({ 'center': this.linePoints[0], 'zoom': 14 });

    this.tid = window.setInterval(() => {
      if (this.i < this.linePoints.length) {
        console.log(this.linePoints[this.i]);
        const point = this.linePoints[this.i];

        if (this.currentMarker) {
          this.currentMarker.remove();
        }

        if (this.options !== undefined && this.options.marker) {
          this.currentMarker = this.options.marker;
        } else {
          // 経路再生
          const moveEl = document.createElement('div');
          moveEl.className = 'marker-gps';
          moveEl.style.backgroundImage = `url(${'/assets/icon/gps_icon.png'})`;
          moveEl.style.backgroundSize = 'cover';
          moveEl.style.width = '20px';
          moveEl.style.height = '20px';
          this.currentMarker = new mapboxgl.Marker(moveEl)
            .setLngLat(point).addTo(this.map);
        }
        this.map.panTo(point);

        this.i++;
      } else {
        window.clearInterval(this.tid);
      }
    }, 1000);
  }
}
