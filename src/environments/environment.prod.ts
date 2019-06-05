export const environment = {
  production: true,
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
    'like_delete_path': '/like_delete',
    'user_path': '/user',
    'migrate_path': '/migrate',
    'expand_url_path': '/expand_shorturl',
    'staticmap_url': 'https://map.yahooapis.jp/map/V1/static',
    'thumbappid': "dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-",

  }
};
