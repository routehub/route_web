import * as mapboxgl from 'mapbox-gl';

export interface Options {
  marker: mapboxgl.Marker;
}
/* eslint-disable class-methods-use-this */
export default class MapboxAnimatedMarker {
  private tid: number | null = null;
  private currentMarker: mapboxgl.Marker | null = null;

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

  private animate() {
    // setup the viewport
    this.map.jumpTo({ 'center': this.linePoints[0], 'zoom': 14 });

    // on a regular basis, add more coordinates from the saved list and update the map
    let i = 0;

    this.tid = window.setInterval(() => {
      if (i < this.linePoints.length) {
        console.log(this.linePoints[i]);
        const point = this.linePoints[i];

        if (this.currentMarker) {
          this.currentMarker.remove();
        }

        if (this.options !== undefined && this.options.marker) {
          this.currentMarker = this.options.marker;
        } else {
          this.currentMarker = new mapboxgl.Marker();
        }
        this.currentMarker.setLngLat(point).addTo(this.map);
        this.map.panTo(point);

        i++;
      } else {
        window.clearInterval(this.tid);
      }
    }, 500);
  }
}
