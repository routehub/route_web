import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import * as firebase from 'firebase';


@Component({
  selector: 'app-migration',
  templateUrl: './migration.page.html',
  styleUrls: ['./migration.page.scss'],
})
export class MigrationPage implements OnInit {
  @ViewChild('importarea') importarea: ElementRef;

  public routeurl: string;
  public items: Array<{ id: string, title: string; author: string; icon: string; color: string; }> = [];
  private migrate_url = 'https://dev-api.routelabo.com/route/1.0.0/migrate';

  constructor(private http: HttpClient, public navCtrl: NavController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  onPaste(event) {
    event.preventDefault();
    //    if (window.clipboardData && window.clipboardData.getData) { // IE pollyfillされるかな...
    //      var pastedText = window.clipboardData.getData('Text');
    //    } else 
    if (!event.clipboardData || !event.clipboardData.getData) {
      return;
    }

    let pastedText: string = event.clipboardData.getData('text/html');
    let m = pastedText.match(/watch\?id=(.*?)"/g);

    if (!m || m.length <= 0) {
      console.log('pasted, but clipboard empty url.');
      return;
    }
    var ids = [];
    for (let i = 0; i < m.length; i++) {
      let id_m = m[i].match(/watch\?id=(.+?)"/);
      if (!ids.includes(id_m[1])) {
        ids.push(id_m[1]);
      }
    }
    for (let i = 0; i < ids.length; i++) {
      this.items.push({
        id: ids[i],
        title: ids[i],
        author: '',
        icon: '',
        color: '',
      });
    }

    this.checkque();
  }

  importUrl() {
    if (!this.routeurl) {
      return;
    }
    let m = this.routeurl.match(/watch\?id=(.*?)$/);
    console.dir(m);

    if (!m) {
      return;
    }
    this.items.push({
      id: m[1],
      title: m[1],
      author: '',
      icon: '',
      color: '',
    });
    this.checkque();
    this.routeurl = '';
  }

  checkque() {
    this.items.map(async item => {
      if (item.color !== '') {
        return;
      }

      try {
        const idToken = await firebase.auth().currentUser.getIdToken(true);
        console.log(idToken);

        const res: any = await this.http.get(this.migrate_url + '?id=' + item.id).toPromise();

        if (res.error) {
          item.title = 'すでに登録済みです';
          item.color = 'danger';
          return;
        }
        item.title = res.title;
        item.author = res.auhor;
        item.color = 'primary';
      } catch (error) {
        console.dir(error);
        item.color = 'danger';
      }
    });
  }

  pageSelected(item) {
    this.navCtrl.navigateForward('/watch/' + item.id);
  }

}
