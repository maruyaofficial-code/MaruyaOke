/* KaraokeKo service worker — offline support.
   Unang beses online: ise-save ang app, SpessaSynth engine (lokal o CDN), SoundFont at mga kantang natugtog.
   Pagkatapos nito, gumagana na kahit walang internet. */
const VER = 'kk-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './sw.js', './vendor/kk_synth_worklet.js', './vendor/spessasynth_core.js'];
const CDN = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];
const MEDIA = /\.(mid|midi|kar|sf2|sf3|mjs|wasm)(\?|$)/i;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VER);
    await Promise.allSettled(SHELL.map(u => c.add(new Request(u, { cache: 'reload' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VER) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function put(req, res) {
  try { if (res && (res.ok || res.type === 'opaque')) await (await caches.open(VER)).put(req, res.clone()); } catch (e) {}
  return res;
}
const cacheFirst = async req => {
  const hit = await caches.match(req, { ignoreSearch: false });
  if (hit) return hit;
  return put(req, await fetch(req));
};
const networkFirst = async (req, fallbackKey) => {
  try { return await put(req, await fetch(req)); }
  catch (e) { return (await caches.match(req)) || (fallbackKey && await caches.match(fallbackKey)) || Response.error(); }
};
const staleWhileRevalidate = async req => {
  const hit = await caches.match(req);
  const net = fetch(req).then(r => put(req, r)).catch(() => null);
  return hit || (await net) || Response.error();
};

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (!/^https?:$/.test(url.protocol)) return;

  if (req.mode === 'navigate') { e.respondWith(networkFirst(req, './index.html')); return; }
  if (CDN.includes(url.hostname)) { e.respondWith(cacheFirst(req)); return; }              // engine mula sa CDN
  if (MEDIA.test(url.pathname)) { e.respondWith(cacheFirst(req)); return; }                // kanta, soundfont, vendor modules
  if (url.origin === location.origin) {
    if (/songs\.json$/i.test(url.pathname)) { e.respondWith(staleWhileRevalidate(req)); return; }
    if (/\/vendor\//.test(url.pathname) || /\.js$/i.test(url.pathname)) { e.respondWith(cacheFirst(req)); return; }
    e.respondWith(staleWhileRevalidate(req));
  }
});
