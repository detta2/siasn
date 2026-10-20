/* SiASN Service Worker — dukungan offline penuh (PWA).
   Strategi: cache-first + runtime caching. Aset inti di-precache saat
   install; SEMUA file lain (termasuk 111 file bank soal ?v=APP_VERSION)
   masuk cache otomatis saat pertama kali diunduh — setelah itu aplikasi
   bisa dipakai 100% offline.
   PENTING: naikkan SW_VERSION setiap rilis, samakan dengan APP_VERSION
   di js/app.js, agar cache lama dibuang dan user menerima versi baru. */
var SW_VERSION = "26";
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

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        if (req.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
