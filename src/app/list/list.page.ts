import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IonInfiniteScroll, NavController/*, NavParams */ } from '@ionic/angular';
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
    icon: string;
    thumburl: string;
  }> = [];
  private page = 0;
  private query = '';
  searchText = '';
  private thumbappid = "dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-";
  loadingAnimation = "../../assets/loadingAnimation.gif";



  constructor(private http: HttpClient, public navCtrl: NavController/*, public navParams: NavParams*/) {
    this.search(this.query, this.page);
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
  }

  pageSelected(item) {
    this.navCtrl.navigateForward('/watch/' + item.id);
  }

  public search(query, page): Promise<any[]> {
    return this.http.get(this.search_url + '?q=' + query + '&page=' + page).toPromise()
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
            icon: 'beer',
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
      + '&autoscale=on&scalebar=off&width=300&height=200&l=' + '255,52,106,90,3,'
      + line;
  }
}
