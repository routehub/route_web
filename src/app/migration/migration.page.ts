import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-migration',
  templateUrl: './migration.page.html',
  styleUrls: ['./migration.page.scss'],
})
export class MigrationPage implements OnInit {
  @ViewChild('importarea') importarea: ElementRef;

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
    var importlist = [];
    if (event.clipboardData && event.clipboardData.getData) {
      let pastedText: string = event.clipboardData.getData('text/html');
      let m = pastedText.match(/<tr id="(.+?)"/g);
      if (m.length <= 0) {
        return;
      }

      for (let i = 0; i < m.length; i++) {
        let id_m = m[i].match(/"(.+?)"/);
        importlist.push(id_m[1]);
      }
    }

    console.dir(importlist);

    // リストを順にインポートしていくUIつくる
  }

  importUrl() {
    // 裏で取り込み処理のリクエストをサーバに投げてDBにはいったらsuccesss的なリストを出す
  }

}
