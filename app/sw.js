var siteCacheName = 'restaurant-static';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(siteCacheName).then((cache) => {
      return cache.addAll([
        // html files
        '/',
        'index.html',
        'restaurant.html',
        // javascript
        'register_sw.js',
        'scripts/main.bundle.js',
        'scripts/restaurant.bundle.js',
        // stylesheets
        'css/styles.css',
        'css/responsive.css',
        'https://use.fontawesome.com/releases/v5.1.1/css/all.css',
        'https://fonts.googleapis.com/css?family=Roboto',
        'https://fonts.googleapis.com/css?family=Merienda',
        // fonts
        'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2',
        'https://fonts.gstatic.com/s/merienda/v5/gNMHW3x8Qoy5_mf8uWMFMIo.woff2',
        'https://use.fontawesome.com/releases/v5.1.1/webfonts/fa-solid-900.woff2',
        'https://use.fontawesome.com/releases/v5.1.1/webfonts/fa-regular-400.woff2'
      ]);
    })
  );
});

self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url);
  
  // if (requestUrl.origin.indexOf('font') != -1) {
  //   console.log(requestUrl);
  // }
  
  // matches all the '/restaurant.html?id=x' requests
  if (requestUrl.pathname === '/restaurant.html') {
    // console.log(requestUrl);
    event.respondWith(caches.match('/restaurant.html'));
    return;
  }

  // // matches all the request to data
  // // We first return the local copy of the file
  // // than update the local copy from the network
  // if (requestUrl.pathname.startsWith('/data')) {
  //   event.respondWith(
  //     caches.open(siteCacheName).then((cache) => {
  //       return cache.match(event.request.url).then((cacheResponse) => {
  //         var netFetch = fetch(event.request).then((netResponse) => {
  //           cache.put(event.request.url, netResponse.clone());
  //           return netResponse;
  //         });
          
  //         return cacheResponse || netFetch;
  //       })
  //     })
  //   );
  //   return;
  // }

  // matches all the requests to jpg images
  if (requestUrl.pathname.endsWith('.jpg')) {
    event.respondWith(
      caches.open(siteCacheName).then((cache) => {
        return cache.match(event.request.url).then((cacheResponse) => {
          var netFetch = fetch(event.request).then((netResponse) => {
            cache.put(event.request.url, netResponse.clone());
            return netResponse;
          });
          
          return cacheResponse || netFetch;
        })
      })
    );
    return;
  }

  // All others requests fetch from the cache than from the network
  event.respondWith(
    caches.open(siteCacheName).then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(event.request);
      });
    }) 
  );
});