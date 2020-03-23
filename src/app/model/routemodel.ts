import polyline from '@mapbox/polyline';

export class RouteModel {
  public id: string;

  public title: string = '';

  public body: string;

  public display_name: string;

  public author: string = '';

  public tag: [];

  public thumburl: string;

  public created_at: string;

  public total_dist: number;

  public total_elevation: number;

  public max_elevation: number;

  public max_slope: number;

  public avg_slope: number;

  public start_point: string;

  public goal_point: string;

  public is_private: boolean;

  public is_private_ja: string;

  public pos = [];

  public pos_latlng = [];

  public level = [];

  public note = [];

  public time = [];

  public kind = [];

  constructor() { }

  public setFullData(r) {
    this.id = r.id;
    this.title = r.title;
    this.body = r.body;
    this.author = r.author || '';
    this.tag = r.tag ? r.tag.split(' ') : [];
    this.display_name = r.display_name || '';
    //this.thumburl = this.getThumbUrl(r.summary);
    this.created_at = r.created_at.slice(0, -14).replace(/-/g, '/');
    this.total_dist = r.total_dist;
    this.total_elevation = r.total_elevation;
    this.max_elevation = r.max_elevation;
    this.max_slope = r.max_slope;
    this.avg_slope = r.avg_slope;
    this.start_point = r.start_point;
    this.goal_point = r.goal_point;
    this.is_private = r.is_private;
    this.is_private_ja = r.is_private ? '非公開' : '公開';

    this.pos_latlng = polyline.decode(r.pos);
    this.pos = this.pos_latlng.map((_p) => [_p[1], _p[0]]);
    this.level = r.level.split(',');
    this.note = r.note;
    this.time = r.time;
    this.kind = r.kind.split(',');
  }

  public setData(r) {
    this.id = r.id;
    this.title = r.title;
    this.body = this.getBodyHead(r.body);
    this.author = r.author || '';
    this.tag = r.tag ? r.tag.split(' ') : [];
    this.display_name = r.display_name || '';
    this.thumburl = this.getThumbUrl(r.summary);
    this.created_at = r.created_at.slice(0, -14).replace(/-/g, '/');
    this.total_dist = r.total_dist;
    this.total_elevation = r.total_elevation;
    this.max_elevation = r.max_elevation;
    this.max_slope = r.max_slope;
    this.avg_slope = r.avg_slope;
    this.start_point = r.start_point;
    this.goal_point = r.goal_point;
    this.is_private = r.is_private;
    this.is_private_ja = r.is_private ? '非公開' : '公開';
  }

  private getBodyHead(body) {
    const limit = 70;
    if (body.length < limit) {
      return body;
    }
    return `${body.substr(0, limit)}...`;
  }

  private staticmap_url = 'https://map.yahooapis.jp/map/V1/static';

  private thumbappid = 'dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-';

  private getThumbUrl(summary) {
    if (!summary) {
      return '';
    }
    summary = polyline.decode(summary)
    const line = summary.map((pos) => pos.join(',')).join(',');
    return `${this.staticmap_url}?appid=${this.thumbappid
      }&autoscale=on&scalebar=off&width=600&height=300&l=` + `0,0,255,105,4,${ // rgb, a, weight
      line}`;
  }

  public static getSummary(pos): String {
    var pos100 = [];
    if (pos.length <= 100) {
      for (let i = 0; i < pos.length; i++) {
        pos100.push(pos[i].join(' '));
      }
    } else {
      let ratio = pos.length / 100;
      for (let i = 0; i < 100; i++) {
        let ir = Math.floor(i * ratio);
        if (!pos[ir]) {
          continue;
        }
        pos100.push(
          pos[ir].join(' ')
        );
      }
    }
    return pos100.join(',');
  }

}
