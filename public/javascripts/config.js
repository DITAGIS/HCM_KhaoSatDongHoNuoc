    var dojoConfig = {
      paths: {
        ditagis: location.href.replace(/\/[^/]+$/, "") + "/javascripts/ditagis",
        jquery: location.href.replace(/\/[^/]+$/, "") + '/javascripts/lib/jquery-3.2.1.min'
      },
      map: {
        '*': {
          'css': location.href.replace(/\/[^/]+$/, "") + '/javascripts/lib/css.min', // or whatever the path to require-css is
        }
      }
    };