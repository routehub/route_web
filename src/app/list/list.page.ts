import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IonInfiniteScroll, NavController } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  private search_url = 'https://dev-api.routelabo.com/route/1.0.0/search';
  private staticmap_url = 'https://map.yahooapis.jp/map/V1/static';
  private thumbappid = "dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-";

  /**
   * 検索用パラメーター
   */
  private page = 0;
  private per_page = 4; // デフォルトはモバイル向けの件数
  public query = ''; // viewとも共通

  /**
   * ルート情報モジュール
   */
  items: Array<{
    id: string,
    title: string;
    author: string;
    thumburl: string;
  }> = [];


  constructor(
    private http: HttpClient,
    public navCtrl: NavController,
  ) {
  }

  ngOnInit() {
    // ウィンドウサイズによって、取得する量を変える（早くしたい&API叩きすぎたくない
    console.dir(window.innerWidth)
    if (window.innerWidth > 600) {
      this.per_page = 10;
    }
    if (window.innerWidth > 800) {
      this.per_page = 12;
    }
    if (window.innerWidth > 1200) {
      this.per_page = 16;
    }
    this.search();
  }


  wordChanged() {
    this.page = 0;
    this.items = [];
    this.search();
  }

  doInfinite(event) {
    this.page++;
    this.search();
  }

  pageSelected(item) {
    this.navCtrl.navigateForward('/watch/' + item.id);
  }

  search(): Promise<any[]> {
    return this.http.get(this.search_url + '?q=' + this.query + '&per_page=' + this.per_page + '&page=' + this.page).toPromise()
      .then((res: any) => {
        if (!res.results) {
          return;
        }
        for (let i = 0; i < res.results.length; i++) {
          let r = res.results[i];
          this.items.push({
            id: r.id,
            title: r.title,
            author: r.author,
            thumburl: this.getThumbUrl(r.summary),
          });

          this.infiniteScroll.complete();
        }

        const response: any = res;
        return response;
      });
  }

  private getThumbUrl(summary) {
    let line = summary.slice(11, -1).split(',').map(pos => {
      let p = pos.split(' ');
      return p[1] + ',' + p[0];
    }).join(',');
    return this.staticmap_url + '?appid=' + this.thumbappid
      + '&autoscale=on&scalebar=off&width=300&height=200&l=' + '0,0,255,105,3,' // rgb, a, weight
      + line;
  }
}
