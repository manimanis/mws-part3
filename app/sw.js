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
  'scripts/worker.js',
  'scripts/main.bundle.js',
  'scripts/restaurant.bundle.js',
  'scripts/worker.bundle.js',
  // stylesheets
  'css/styles.css',
  'css/responsive.css',
  // 'css/all.min.css'
];

// External resources are not located on localhost
// they could not be fetched if the computer is
// disconnected from the network
var externalResources = [
  // javascript
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  // stylesheets
  'https://fonts.googleapis.com/css?family=Roboto',
  'https://fonts.googleapis.com/css?family=Merienda',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  // // fonts
  // 'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2',
  // 'https://fonts.gstatic.com/s/merienda/v5/gNMHW3x8Qoy5_mf8uWMFMIo.woff2',
  // 'https://use.fontawesome.com/releases/v5.1.1/webfonts/fa-solid-900.woff2',
  // 'https://use.fontawesome.com/releases/v5.1.1/webfonts/fa-regular-400.woff2'
];

self.addEventListener('install', function (event) {
  const allResources = internalResources.concat(externalResources);

  event.waitUntil(
    caches.open(siteCacheName).then((cache) => {
      console.log('sw install');

      // Try to fetch all resources from the network
      return cache.addAll(allResources)
        .then(() => console.log('sw install - all resources are loaded'))
        // if the fetch fails fallback to the cached files
        // and load only available files in cache
        .catch(error => {
          console.log('sw install - failed to load all resources');
          return cache.keys()
            .then(keys => {
              const availableResources = keys.map(request => request.url)
                .filter(url => externalResources.includes(url));
              if (availableResources.length === externalResources.length) {
                console.log('sw install - external resources are in the cache');
              }
              console.log('trying to load internal resources');
              return cache.addAll(internalResources);
              // return Promise.reject("Minimal resources are not availables");
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
  if (requestUrl.pathname.endsWith('.jpg') ||
    // matches all the requests to web fonts
    requestUrl.pathname.endsWith('.woff2') ||
    requestUrl.pathname.endsWith('.woff') ||
    requestUrl.pathname.endsWith('.ttf')) {
    event.respondWith(cacheFirst(siteCacheName, event.request));
    return;
  }

  // cache map tiles
  if (event.request.url.startsWith('https://api.tiles.mapbox.com/v4/') ||
    event.request.url.startsWith('https://unpkg.com/leaflet@1.3.1/dist/images/')) {
    event.respondWith(cacheFirst(mapTilesCacheName, event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', function (event) {

});

/**
 * Try to fetch the "request" from "cacheName" if failed
 * load from network than cache
 * @param {string} cacheName 
 * @param {string} request 
 */
function cacheFirst(cacheName, request) {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request.url).then((cacheResponse) => {
      var netFetch = fetch(request).then((netResponse) => {
        cache.put(request.url, netResponse.clone());
        return netResponse;
      });

      return cacheResponse || netFetch;
    });
  });
}