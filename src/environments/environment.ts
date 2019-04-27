// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // TODO 本番運用用に変更する
  firebase: {
    apiKey: 'AIzaSyAUNac1J0FeWxE82q3kwuHfkds9aPz-VE8',
    authDomain: 'route-lab.firebaseapp.com',
    databaseURL: 'https://route-lab.firebaseio.com',
    projectId: 'route-lab',
    storageBucket: 'route-lab.appspot.com',
    messagingSenderId: '409666348022'
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
