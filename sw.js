const CACHE_NAME = 'dudugames-v18';
const ASSETS = [
  './',
  './index.html',
  './shared.css',
  './shared.js',
  './manifest.webmanifest',
  './favicon.svg',
  './icons/icon.svg',
  './icons/maskable-icon.svg',
  './cobrinha/',
  './cobrinha/index.html',
  './memoria/',
  './memoria/index.html',
  './2048/',
  './2048/index.html',
  './campo-minado/',
  './campo-minado/index.html',
  './velha/',
  './velha/index.html',
  './pong/',
  './pong/index.html',
  './tetris/',
  './tetris/index.html',
  './simon/',
  './simon/index.html',
  './forca/',
  './forca/index.html',
  './sudoku/',
  './sudoku/index.html',
  './space-invaders/',
  './space-invaders/index.html',
  './golfe/',
  './golfe/index.html',
  './flappy/',
  './flappy/index.html',
  './breakout/',
  './breakout/index.html',
  './quick-games.js',
  './dino/',
  './dino/index.html',
  './labirinto/',
  './labirinto/index.html',
  './bolha/',
  './bolha/index.html',
  './whack/',
  './whack/index.html',
  './genius2/',
  './genius2/index.html',
  './memoria-temas/',
  './memoria-temas/index.html',
  './pacman/',
  './pacman/index.html',
  './xadrez/',
  './xadrez/index.html',
  './paciencia/',
  './paciencia/index.html',
  './freecell/',
  './freecell/index.html',
  './spider/',
  './spider/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./')))
  );
});
