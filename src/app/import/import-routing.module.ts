import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportPage } from './import.page';

const routes: Routes = [
  {
    path: '',
    component: ImportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportPageRoutingModule {}
