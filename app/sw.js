var siteCacheName = 'restaurant-static';
var mapTilesCacheName = 'restaurant-map-tiles';

// This resources are located on localhost
// they could be fetched any time the server is on
var internalResources = [
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
];

// External resources are not located on localhost
// they could not be fetched if the computer is
// disconnected from the network
var externalResources = [
  // javascript
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  // stylesheets
  'https://use.fontawesome.com/releases/v5.1.1/css/all.css',
  'https://fonts.googleapis.com/css?family=Roboto',
  'https://fonts.googleapis.com/css?family=Merienda',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  // fonts
  'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2',
  'https://fonts.gstatic.com/s/merienda/v5/gNMHW3x8Qoy5_mf8uWMFMIo.woff2',
  'https://use.fontawesome.com/releases/v5.1.1/webfonts/fa-solid-900.woff2',
  'https://use.fontawesome.com/releases/v5.1.1/webfonts/fa-regular-400.woff2'
];

self.addEventListener('install', function (event) {
  const allResources = internalResources.concat(externalResources);

  event.waitUntil(
    caches.open(siteCacheName).then((cache) => {
      // Try to fetch all resources from the network
      return cache.addAll(allResources)
        // if the fetch fails fallback to the cached files
        // and load only available files in cache
        .catch(error => {
          return cache.keys()
          .then(keys => {
            const availableResources = keys.map(request => request.url).filter(url => externalResources.includes(url));
            if (availableResources.length === externalResources.length) {
              return cache.addAll(internalResources);
            }
            return Promise.reject("Minimal resources are not availables");
          });
        });
    })
  );
});

self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url);

  // matches all the '/restaurant.html?id=x' requests
  if (requestUrl.pathname === '/restaurant.html') {
    // console.log(requestUrl);
    event.respondWith(caches.match('/restaurant.html'));
    return;
  }

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
        });
      })
    );
    return;
  }

  // cache map tiles
  if (event.request.url.startsWith('https://api.tiles.mapbox.com/v4/')) {
    event.respondWith(
      caches.open(mapTilesCacheName).then((cache) => {
        return cache.match(event.request.url).then((cacheResponse) => {
          var netFetch = fetch(event.request).then((netResponse) => {
            cache.put(event.request.url, netResponse.clone());
            return netResponse;
          });

          return cacheResponse || netFetch;
        });
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