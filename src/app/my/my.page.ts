import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { ɵPLATFORM_WORKER_UI_ID } from '@angular/common';

@Component({
  selector: 'app-my',
  templateUrl: './my.page.html',
  styleUrls: ['./my.page.scss', '../list/list.page.scss'],
})
export class MyPage implements OnInit {

  uid;
  photoURL;
  displayName;
  body = "最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない最近ロードのってない"

  constructor(
    private navCtrl: NavController,
    private storage: Storage,
  ) { }

  ngOnInit() {
    // ログイン確認
    var that = this;
    // TODO : なんかココらへん処理をまとめたほうが良さそう, JSONで格納したほうがよさそう
    this.storage.get('user.uid').then((uid) => {
      // 非ログインの場合は /loginへ遷移
      if (ɵPLATFORM_WORKER_UI_ID == null) {
        this.navCtrl.navigateForward('/login');
      }
      that.uid = uid;
    }).catch(e => {
      // 非ログインの場合は /loginへ遷移
      this.navCtrl.navigateForward('/login');
    });
    this.storage.get('user.displayName').then((displayName) => {
      this.displayName = displayName;
    });
    this.storage.get('user.photoURL').then((photoURL) => {
      that.photoURL = photoURL;
    });

  }

  ionViewWillEnter() {
    // searchでfirebase_tokenで検索
    // 遷移きちんと確認した暗号つくる

  }


  // TODO ログアウトリンクはこのページのどこかに置く

}
