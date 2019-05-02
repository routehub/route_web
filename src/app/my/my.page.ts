import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss', '../list/list.page.scss'],
})
export class MyPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // TODO ログアウトリンクはこのページのどこかに置く

}
