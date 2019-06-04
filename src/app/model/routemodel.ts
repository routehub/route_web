import { environment } from '../../environments/environment';

export class RouteModel {
    public id: string;
    public title: string = "";
    public body: string;
    public creator_name: string;
    public author: string = "";
    public thumburl: string;
    public created_at: string;
    public total_dist: number;
    public total_elevation: number;
    public max_elevation: number;
    public max_slope: number;
    public avg_slope: number;
    public start_point: string;
    public goal_point: string;

    public pos = [];
    public level = [];
    public note = [];
    public time = [];

    constructor() { }

    public setFullData(r) {
        console.dir(r);
        this.id = r.id;
        this.title = r.title;
        this.body = r.body;
        this.author = r.author || "";
        this.creator_name = r.author || "";
        //this.thumburl = this.getThumbUrl(r.summary);
        this.created_at = r.created_at.slice(0, -14).replace(/-/g, '/');
        this.total_dist = r.total_dist;
        this.total_elevation = r.total_elevation;
        this.max_elevation = r.max_elevation;
        this.max_slope = r.max_slope;
        this.avg_slope = r.avg_slope;
        this.start_point = r.start_point;
        this.goal_point = r.goal_point;

        this.pos = r.pos.split(',').map(p => { return p.split(' ') });
        this.level = r.level.split(',')
        this.note = r.note;
        this.time = r.time;
    }

    public setData(r) {
        this.id = r.id;
        this.title = r.title;
        this.body = this.getBodyHead(r.body);
        this.author = r.author || "";
        this.creator_name = r.author || "";
        this.thumburl = this.getThumbUrl(r.summary);
        this.created_at = r.created_at.slice(0, -14).replace(/-/g, '/');
        this.total_dist = r.total_dist;
        this.total_elevation = r.total_elevation;
        this.max_elevation = r.max_elevation;
        this.max_slope = r.max_slope;
        this.avg_slope = r.avg_slope;
        this.start_point = r.start_point;
        this.goal_point = r.goal_point;
    }
    private getBodyHead(body) {
        let limit = 70;
        if (body.length < limit) {
            return body;
        }
        return body.substr(0, limit) + '...';
    }
    private staticmap_url = 'https://map.yahooapis.jp/map/V1/static';
    private thumbappid = "dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-";
    private getThumbUrl(summary) {
        let line = summary.slice(11, -1).split(',').map(pos => {
            let p = pos.split(' ');
            return p[1] + ',' + p[0];
        }).join(',');
        return this.staticmap_url + '?appid=' + this.thumbappid
            + '&autoscale=on&scalebar=off&width=600&height=300&l=' + '0,0,255,105,4,' // rgb, a, weight
            + line;
    }
}
