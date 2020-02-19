var CACHE_NAME = 'web-slides-v1';

var files = {
  'static': ['css/styles.css', 'css/pygments.css', 'js/jquery-1.10.2.min.js', 'js/htmlSlides.js'],
  dynamic: ['css/sky.css', 'js/sky.js'],
  pages: [
    'INTRO.html', 'HTML.html', 'Forms.html', 'PHP.html', 'PHP-SQL.html',
    'CSS-1.html', 'CSS-2.html', 'JS-1.html', 'JS-2.html', 'index.html', '/'
  ]
};
var strategies = {
  cacheFirst: function(request) {
    return caches.match(request, {ignoreSearch: true}).then(function(response) {
      return response || fetch(request);
    });
  },
  networkFirst: function(request) {
    return fetch(request).catch(function() {
      return caches.match(request, {ignoreSearch: true});
    });
  },
  staleWhileRevalidate: function(request) {
    return caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(request, {ignoreSearch: true}).then(function(response) {
        var fetchPromise = fetch(request).then(function(networkResponse) {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    });
  }
};

self.addEventListener('install', function(event) {
  console.log('Installing App');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      cache.addAll(files.pages);
      return cache.addAll(files.static.concat(files.dynamic));
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  console.log('fetching ' + request.url);
  if (request.url.indexOf('http') === 0) { // ignore non-http(s) requests
    event.respondWith(strategies.staleWhileRevalidate(request));
  }

});

// var strategies = {
//   cacheOrNetwork: req => caches.match(req).then(res => res || fetch(req)),
//   networkOrCache: req => fetch(req).catch(_ => caches.match(req)),
// };

