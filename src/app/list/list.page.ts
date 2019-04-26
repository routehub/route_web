import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { lineString } from '@turf/helpers';
import { splitAtColon } from '@angular/compiler/src/util';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild('searchbar') searchbar_elem: ElementRef;

  private search_url = 'https://dev-api.routelabo.com/route/1.0.0/search';
  private staticmap_url = 'https://map.yahooapis.jp/map/V1/static';
  public items: Array<{
    id: string,
    title: string;
    author: string;
    thumburl: string;
  }> = [];
  private page = 0;
  private per_page = 4;
  private query = '';
  searchText = '';
  private thumbappid = "dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-";
  loadingAnimation = "../../assets/loadingAnimation.gif";



  constructor(private http: HttpClient, public navCtrl: NavController) {
  }

  public wordChanged() {
    this.page = 0;
    this.query = this.searchText;
    this.items = [];
    this.search(this.query, this.page);
  }

  doInfinite(event) {
    console.dir('infini');
    this.page++;
    this.search(this.query, this.page);
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
    this.search(this.query, this.page);

  }

  pageSelected(item) {
    this.navCtrl.navigateForward('/watch/' + item.id);
  }

  public search(query, page): Promise<any[]> {
    return this.http.get(this.search_url + '?q=' + query + '&per_page=' + this.per_page + '&page=' + page).toPromise()
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

  getThumbUrl(summary) {
    let line = summary.slice(11, -1).split(',').map(pos => {
      let p = pos.split(' ');
      return p[1] + ',' + p[0];
    }).join(',');
    return this.staticmap_url + '?appid=' + this.thumbappid
      + '&autoscale=on&scalebar=off&width=300&height=200&l=' + '0,0,255,105,3,' // rgb, a, weight
      + line;
  }
}
