import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';

import { IonicModule } from '@ionic/angular';

import { MyPage } from './my.page';

const routes: Routes = [
  {
    path: '',
    component: MyPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset,
    }),
    RouterModule.forChild(routes),
  ],
  declarations: [MyPage],
})
export class MyPageModule { }
