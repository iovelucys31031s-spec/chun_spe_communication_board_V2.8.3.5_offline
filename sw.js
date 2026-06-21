const CACHE_NAME = 'aac-board-v2.9.2'; // 推進版本號，以觸發全新的「更新中」進度條畫面

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.6/babel.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(urlsToCache.map(url => {
        return fetch(url).then(response => {
          if (response.ok || response.type === 'opaque') {
            return cache.put(url, response);
          }
        }).catch(err => console.log('快取失敗的檔案:', url, err));
      }));
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      
      return fetch(event.request).then(netRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, netRes.clone());
          return netRes;
        });
      });
    }).catch(() => console.log('目前處於離線狀態，且無法取得該檔案。'))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});