import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { SearchSettingComponent } from '../search-setting/search-setting.component';


import { ListPage } from './list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset,
    }),
    RouterModule.forChild([
      {
        path: '',
        component: ListPage,
      },
    ]),
  ],
  declarations: [
    ListPage,
    SearchSettingComponent,
  ],
  entryComponents: [
    SearchSettingComponent,
  ],
})
export class ListPageModule { }
