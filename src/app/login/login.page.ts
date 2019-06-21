import { Component, OnInit } from '@angular/core';
import * as firebaseui from 'firebaseui';
import * as firebase from 'firebase/app';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  ngOnInit() {
    this.login();
  }

  ionViewDidEnter() {
    window.document.title = 'ログイン RouteHub(β)';
  }

  // ログイン処理
  async login() {
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    const uiCofig = {
      signInOptions: [
        // List of OAuth providers supported.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: 'https://' + environment.hostname + '/my'
    };
    ui.start('#firebaseui-auth-container', uiCofig);
  }
}
