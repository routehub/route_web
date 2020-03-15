import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', redirectTo: '' }, // ブラウザキャッシュ対策
  { path: '', loadChildren: () => import('./list/list.module').then(m => m.ListPageModule) },
  { path: 'watch/:id', loadChildren: () => import('./watch/watch.module').then(m => m.WatchPageModule) },
  { path: 'migration', loadChildren: () => import('./migration/migration.module').then(m => m.MigrationPageModule) },
  { path: 'routeinfo', loadChildren: () => import('./routeinfo/routeinfo.module').then(m => m.RouteinfoPageModule) },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'export', loadChildren: () => import('./export/export.module').then(m => m.ExportPageModule) },
  { path: 'my', loadChildren: () => import('./my/my.module').then(m => m.MyPageModule) },
  { path: 'layerselect', loadChildren: () => import('./layerselect/layerselect.module').then(m => m.LayerselectPageModule) },
  { path: 'edit', loadChildren: () => import('./edit/edit.module').then(m => m.EditPageModule) },
  { path: 'edit/:id', loadChildren: () => import('./edit/edit.module').then(m => m.EditPageModule) },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
