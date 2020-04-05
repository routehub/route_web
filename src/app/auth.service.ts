import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentLoginUser: firebase.User // 簡易的にログイン状態を保持

  user: Observable<firebase.User>

  constructor(private angularFireAuth: AngularFireAuth) {
    this.user = angularFireAuth.authState

    this.user.subscribe(u => {
      console.log('subcribe')
      console.dir(u)

      this.currentLoginUser = u
    })
  }

  public signupWithGoogle() {
    this.angularFireAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider())
  }

  public signupWithFacebook() {
    this.angularFireAuth.auth.signInWithRedirect(new firebase.auth.FacebookAuthProvider())
  }

  public signupWithTwitter() {
    this.angularFireAuth.auth.signInWithRedirect(new firebase.auth.TwitterAuthProvider())
  }

  public signupWithEmail() {
    this.angularFireAuth.auth.signInWithRedirect(new firebase.auth.EmailAuthProvider())
  }

  public logout() {
    this.angularFireAuth.auth.signOut()
  }

}
