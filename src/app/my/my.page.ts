import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss', '../list/list.page.scss'],
})
export class MyPage implements OnInit {

  constructor() { }

  ngOnInit() {
    // ログイン確認

    // 非ログインの場合は /loginへ遷移

  }

  ionViewWillEnter() {
    // searchでfirebase_tokenで検索

  }


  // TODO ログアウトリンクはこのページのどこかに置く

}
