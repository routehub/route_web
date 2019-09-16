import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'list',
    loadChildren: './list/list.module#ListPageModule'
  },
  {
    path: 'watch/:id',
    loadChildren: './watch/watch.module#WatchPageModule'
  },
  { path: 'migration', loadChildren: './migration/migration.module#MigrationPageModule' },
  { path: 'routeinfo', loadChildren: './routeinfo/routeinfo.module#RouteinfoPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'export', loadChildren: './export/export.module#ExportPageModule' },
  { path: 'my', loadChildren: './my/my.module#MyPageModule' },
  { path: 'layerselect', loadChildren: './layerselect/layerselect.module#LayerselectPageModule' },
  { path: 'edit', loadChildren: './edit/edit.module#EditPageModule' },
  { path: 'edit/:id', loadChildren: './edit/edit.module#EditPageModule' },
  { path: 'terms', loadChildren: './terms/terms.module#TermsPageModule' },
  { path: 'privacypolicy', loadChildren: './privacypolicy/privacypolicy.module#PrivacypolicyPageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
