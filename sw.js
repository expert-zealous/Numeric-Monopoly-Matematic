const CACHE_NAME = 'numeric-monopoly-shell-v30';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './game-ui.css',
  './brand-assets.css',
  './tiles-ui.css',
  './property-ui.css',
  './gameplay-ui.css',
  './character-ui.css',
  './bank-ui.css',
  './modal-ui.css',
  './question-ui.css',
  './battle-ui.css',
  './camera-ui.css',
  './ownership-ui.css',
  './compact-ui.css',
  './focus-ui.css',
  './menus-ui.css',
  './fullscreen-game.css',
  './emergency-ui.css',
  './turn-end-ui.css',
  './final-fit.css',
  './drawer-ui.css',
  './dice-ui.css',
  './cash-ui.css',
  './game-state-ui.css',
  './timer-ui.css',
  './no-active-glow.css',
  './token-ui.css',
  './app.js',
  './firebase.js',
  './firebase-config.js',
  './manifest.webmanifest',
  './sw.js',
  './assets/logo-favicon.png',
  './assets/logo-numeric-monopoly-matematic.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
