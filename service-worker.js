const CACHE_NAME = "myfittrack-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html",         // ログインページ（旧login.html）
  "./mypage.html",
  "./auth.js",
  "./mypage.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// インストール時：初期キャッシュ登録
self.addEventListener("install", event => {
  console.log("[SW] Installing & caching...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // 即時適用
});

// 有効化時：古いキャッシュ削除
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // 即座に制御
});

// fetch：オンライン優先 → オフライン時にキャッシュ
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
