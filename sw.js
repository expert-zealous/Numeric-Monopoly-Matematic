const CACHE_NAME = 'numeric-monopoly-shell-v40';
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
  './assets/logo-numeric-monopoly-matematic.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/themes/board-theme-00-classic-midnight.png',
  './assets/themes/board-theme-01-aurora-valley.png',
  './assets/themes/board-theme-02-velvet-royale.png',
  './assets/themes/board-theme-03-oceanic-glass.png',
  './assets/themes/board-theme-04-midnight-gold.png',
  './assets/themes/board-theme-05-cyber-city.png',
  './assets/themes/dice-theme-00-standard.png',
  './assets/themes/dice-theme-01-neon-prism.png',
  './assets/themes/dice-theme-02-cosmic-orbit.png',
  './assets/themes/dice-theme-03-royal-gold.png',
  './assets/themes/dice-theme-04-sakura-bloom.png',
  './assets/themes/dice-theme-05-cyber-pulse.png'
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
