/* eslint-disable camelcase */

/**
 * ルートModel
 * いろんなところで使いまわしたい
 */
export default class Route {
  id: string;

  title: string;

  body: string;

  tag: string;

  author: string;

  summary: string;

  thumburl: string;

  is_gps: boolean;

  is_private: boolean;

  created_at: string;

  private staticmap_url = 'https://map.yahooapis.jp/map/V1/static';

  private thumbappid = 'dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-';

  private getThumbUrl(summary) {
    const line = summary.slice(11, -1).split(',').map((pos) => {
      const p = pos.split(' ')
      return `${p[1]},${p[0]}`
    }).join(',')
    return `${this.staticmap_url}?appid=${this.thumbappid}&autoscale=on&scalebar=off&width=450&height=300&l=0,0,255,105,4,${ // rgb, a, weight
      line}`
  }
}
