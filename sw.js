/* SiASN Service Worker — dukungan offline penuh (PWA) + update aman.

   STRATEGI HYBRID:
   - NETWORK-FIRST (fallback cache saat offline): dokumen navigasi
     (index.html) dan shell utama — js/app.js, js/mentor.js, js/path.js,
     css/style.css. User yang online SELALU dapat kode terbaru setelah
     setiap rilis, tidak pernah nyangkut di versi lama; saat offline,
     salinan cache terakhir yang tampil.
   - CACHE-FIRST (+ runtime caching): 111 file bank soal js/data/* dan
     three.min.js — besar & jarang berubah; diunduh sekali, lalu selalu
     dari cache (termasuk saat online) agar hemat kuota & instan.

   AUTO-UPDATE TEGAS: skipWaiting() saat install + clients.claim() saat
   activate + semua cache versi lama DIHAPUS di activate.
   PENTING: naikkan SW_VERSION setiap rilis, samakan dengan APP_VERSION
   di js/app.js. */
var SW_VERSION = "27";
var CACHE = "siasn-v" + SW_VERSION;
var CORE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/path.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./og-image.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isNetworkFirst(url, req) {
  if (req.mode === "navigate") return true;
  var p = url.pathname;
  return /\/(index\.html|js\/app\.js|js\/mentor\.js|js\/path\.js|css\/style\.css)$/.test(p);
}

function putCache(req, res) {
  if (res && res.status === 200) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(req, copy); });
  }
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  if (isNetworkFirst(url, req)) {
    /* Network-First: online = selalu versi terbaru; offline = cache. */
    e.respondWith(
      fetch(req).then(function (res) {
        putCache(req, res);
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match("./index.html");
        });
      })
    );
    return;
  }

  /* Cache-First: bank soal, three.min.js, ikon, dan aset statis lain. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        putCache(req, res);
        return res;
      }).catch(function () {
        if (req.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
