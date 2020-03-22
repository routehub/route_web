export const environment = {
  production: false,
  // TODO ファイルを分けて隠蔽する
  firebase: {
    apiKey: 'AIzaSyB0msydnFuVba0qJGT5geWMNqiYjzvN35M',
    authDomain: 'route-lab-63f4a.firebaseapp.com',
    databaseURL: 'https://route-lab-63f4a.firebaseio.com',
    projectId: 'route-lab-63f4a',
    storageBucket: 'route-lab-63f4a.appspot.com',
    messagingSenderId: '1000468098052'
  },

  hostname: 'http://localhost:8100',

  api: {
    'host': 'https://api.routehub.app/route/1.0.0',
    'routing_path': '/routing',
    'migrate_path': '/migrate',
    'expand_url_path': '/expand_shorturl',
    'graphql_host': 'http://localhost:4000/',
    'staticmap_url': 'https://map.yahooapis.jp/map/V1/static',
    'thumbappid': "dj00aiZpPXFPNk1BUG4xYkJvYSZzPWNvbnN1bWVyc2VjcmV0Jng9N2U-",
  },
  routingapi: 'https://routing.routehub.app/route/1.0.0/routing'
};