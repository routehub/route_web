export const environment = {
  production: true,
  // warn: devと同じ
  firebase: {
    apiKey: 'AIzaSyCpxOB8YkNcMsFoZR4DLZXZ5A2MizcfHbQ',
    authDomain: 'rroutehub-942ea.firebaseapp.com',
    databaseURL: 'https://routehub-942ea.firebaseio.com',
    projectId: 'route-lab-63f4a',
    storageBucket: 'routehub-942ea.firebaseapp.com',
    messagingSenderId: '753711559587'
  },


  hostname: 'routehub.app',

  api: {
    'host': 'https://api.routehub.app/route/1.0.0',
    'search_path': '/search',
    'route_path': '/route',
    'route_delete_path': '/route_delete',
    'my_path': '/my',
    'like_path': '/like',
    'like_delete_path': '/like_delete',
    'user_path': '/user',
    'migrate_path': '/migrate',
    'expand_url_path': '/expand_shorturl',
    'staticmap_url': 'https://map.yahooapis.jp/map/V1/static',
    'thumbappid': "dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-",

  }
};
