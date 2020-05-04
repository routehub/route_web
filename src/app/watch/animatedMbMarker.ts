import * as mapboxgl from 'mapbox-gl'
import distance from '@turf/distance'
import * as turf from '@turf/helpers'

export interface Options {
  iconUrl?: string
  interval?: number
  distance?: number
}
/* eslint-disable class-methods-use-this */
export default class MapboxAnimatedMarker {
  private tid: number | null = null

  private i = 0

  private readonly LAYER_ID = 'animationLayer'

  private readonly SOURCE_ID = 'animationSource'

  private readonly ICON_IMAGE_ID = 'animationIcon'

  private isResume = false

  constructor(
    private map: mapboxgl.Map,
    private linePoints: mapboxgl.LngLat[],
    private options?: Options,
  ) {
    this.setOptions(this.options)
    this.map.loadImage(this.options.iconUrl, (err, image) => {
      this.map.addImage(this.ICON_IMAGE_ID, image)
    })
  }

  public start() {
    console.log(this.linePoints.length)
    this.linePoints = this.chunkLatLngs(this.linePoints)
    console.log(this.linePoints.length)

    this.animate()
  }

  public stop() {
    this.isResume = true
    if (this.tid) {
      window.clearInterval(this.tid)
    }
  }

  public reset() {
    this.isResume = false
    stop()
    this.i = 0
  }

  public setInterval(interval: number) {
    this.options.interval = interval || 500
  }

  private animate() {
    if (!this.isResume) {
      this.map.jumpTo({ center: this.linePoints[0], zoom: 14 })
    }

    this.tid = window.setInterval(() => {
      if (this.i < this.linePoints.length) {
        const point = this.linePoints[this.i]

        if (this.map.getLayer(this.LAYER_ID)) {
          this.map.removeLayer(this.LAYER_ID)
          this.map.removeSource(this.SOURCE_ID)
        }

        // 経路再生
        this.map.addSource(this.SOURCE_ID,
          {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [point.lng, point.lat],
                  },
                },
              ],
            },
          } as mapboxgl.GeoJSONSourceRaw)
        this.map.addLayer({
          id: this.LAYER_ID,
          type: 'symbol',
          source: this.SOURCE_ID,
          layout: {
            'icon-image': this.ICON_IMAGE_ID,
            'icon-size': 0.1, // 1/10:200px -> 20px
            'icon-allow-overlap': true, // fade/out effect消してる
          },
          paint: {
            'icon-opacity-transition': {
              duration: 0,
            },
          },
        })

        this.map.panTo(point)
        this.i++
      } else {
        window.clearInterval(this.tid)
      }
    }, this.options.interval)
  }

  private setOptions(options?: Options) {
    this.options = {} as Options
    this.options.iconUrl = '/assets/icon/gps_icon.png'
    this.options.distance = 50
    this.options.interval = 500
    if (!options) {
      return
    }

    if (options.iconUrl) {
      this.options.iconUrl = options.iconUrl
    }
    if (options.distance) {
      this.options.distance = options.distance
    }
    if (options.interval) {
      this.options.interval = options.interval
    }
  }

  private chunkLatLngs(latlngs) {
    let i
    const len = latlngs.length
    const chunkedLatLngs = []

    for (i = 1; i < len; i++) {
      let cur = latlngs[i - 1]
      const next = latlngs[i]
      let dist = (distance(turf.point([next.lng, next.lat]), turf.point([cur.lng, cur.lat]), { unit: 'kilometers' }) * 1000)
      console.log(cur)
      console.log(next)
      console.log(dist)
      const factor = this.options.distance / dist
      const dLat = factor * (next.lat - cur.lat)
      const dLng = factor * (next.lng - cur.lng)

      if (dist > this.options.distance) {
        while (dist > this.options.distance) {
          cur = new mapboxgl.LngLat(cur.lng + dLng, cur.lat + dLat)
          // dist = cur.distanceTo(next);
          dist = (distance(turf.point([next.lng, next.lat]), turf.point([cur.lng, cur.lat]), { unit: 'kilometers' }) * 1000)
          chunkedLatLngs.push(cur)
        }
      } else {
        chunkedLatLngs.push(cur)
      }
    }
    chunkedLatLngs.push(latlngs[len - 1])

    return chunkedLatLngs
  }
}
