import { Component, OnInit } from '@angular/core'
import { AuthService } from '../auth.service'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private loginSubscription: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginSubscription = this.authService.user.subscribe((u) => {
      // ログイン時はログイン後myに遷移
      if (u !== null) {
        this.router.navigate(['/my'])
      }
    })
  }

  ngOnDestroy() {
    // 画面遷移時に購読解除
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  ionViewDidEnter() {
    window.document.title = 'ログイン RouteHub(β)'
  }
}
