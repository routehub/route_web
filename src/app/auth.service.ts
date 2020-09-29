import { Injectable } from '@angular/core'
import { AngularFireAuth } from 'angularfire2/auth'
import * as firebase from 'firebase/app'
import { Observable } from 'rxjs/Observable'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * ログイン状態を保持
   * 各インスタンス内で状態をコピーせずここを参照すること
   */
  currentLoginUser: firebase.User

  user: Observable<firebase.User>

  constructor(private angularFireAuth: AngularFireAuth) {
    this.user = angularFireAuth.authState
    this.user.subscribe((u) => {
      this.currentLoginUser = u
    })
  }

  public login(provider: String) {
    let authProvider: any
    switch (provider) {
      case 'google':
        authProvider = new firebase.auth.GoogleAuthProvider()
        break
      case 'facebook':
        authProvider = new firebase.auth.FacebookAuthProvider()
        break
      case 'twitter':
        authProvider = new firebase.auth.TwitterAuthProvider()
        break
      case 'email':
        authProvider = new firebase.auth.EmailAuthProvider()
        break
      default:
        console.error(provider) // eslint-disable-line 
    }
    this.angularFireAuth.auth.signInWithRedirect(authProvider)
  }

  public logout() {
    this.angularFireAuth.auth.signOut()
  }
}
