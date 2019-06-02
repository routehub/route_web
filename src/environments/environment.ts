// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // warn: devと同じ
  firebase: {
    apiKey: 'AIzaSyB0msydnFuVba0qJGT5geWMNqiYjzvN35M',
    authDomain: 'route-lab-63f4a.firebaseapp.com',
    databaseURL: 'https://route-lab-63f4a.firebaseio.com',
    projectId: 'route-lab-63f4a',
    storageBucket: 'route-lab-63f4a.appspot.com',
    messagingSenderId: '1000468098052'
  },

  api: {
    'host': 'https://dev-api.routelabo.com/route/1.0.0',
    'search_path': '/search',
    'route_path': '/route',
    'route_delete_path': '/route_delete',
    'my_path': '/my',
    'like_path': '/like',
    'user_path': '/user',
    'staticmap_url': 'https://map.yahooapis.jp/map/V1/static',
    'thumbappid': "dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-",

  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
