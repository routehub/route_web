import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-migration',
  templateUrl: './migration.page.html',
  styleUrls: ['./migration.page.scss'],
})
export class MigrationPage implements OnInit {
  @ViewChild('importarea') importarea: ElementRef;

  public items: Array<{ id: string, title: string; author: string; icon: string }> = [];

  constructor() { }

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
    for (let i = 0; i < m.length; i++) {
      let id_m = m[i].match(/watch\?id=(.+?)"/);
      let id = id_m[1];
      let item = {
        id: id,
        title: id,
        author: '',
        icon: ''
      };
      this.items.push(item);
    }
    // TODO: ★をつけたルートは別ロジックで取る（ユーザーに選ばせてあげたほうが良さそう

    // リストを順にインポートしていくUIつくる
  }

  importUrl() {
    // 裏で取り込み処理のリクエストをサーバに投げてDBにはいったらsuccesss的なリストを出す
  }

}
