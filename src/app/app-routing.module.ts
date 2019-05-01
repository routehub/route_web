import { NgModule } from '@angular/core';
import { PreloadingStrategy, PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Observable, of } from 'rxjs';

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
  { path: 'export', loadChildren: './export/export.module#ExportPageModule' }
];
export class SimpleLoadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: Function): Observable<any> {
    if (route.data && route.data.preload) {
      return load();
    }
    return of(null);
  }
}

@NgModule({
  providers: [SimpleLoadingStrategy],
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: SimpleLoadingStrategy })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
