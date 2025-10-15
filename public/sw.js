const CACHE_NAME = '4137-game-v1.0.4';
const urlsToCache = [
    '/',
    '/index.html',
    '/index.css',
    '/images/4137.png',
    '/images/icon-192.png',
    '/images/icon-512.png',
    '/images/v4137.png',
    '/images/smart.png',
    '/images/wide.png',
    '/manifest.json'
];

// Service Worker のインストール
self.addEventListener('install', (event) => {
    // 新しいService Workerを即座にアクティブにする
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Service Worker のアクティベーション
self.addEventListener('activate', (event) => {
    // クライアントをすぐに制御下に置く
    event.waitUntil(
        Promise.all([
            // 古いキャッシュを削除
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // クライアントをすぐに制御
            self.clients.claim()
        ])
    );
});

// リクエストの処理
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにあればそれを返す
                if (response) {
                    return response;
                }

                // ネットワークからフェッチを試行
                return fetch(event.request).then((response) => {
                    // レスポンスが無効な場合はそのまま返す
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Viteビルド済みファイル、フォント、画像をキャッシュ
                    const shouldCache =
                        event.request.url.includes('/assets/') || // Viteビルド済みファイル
                        event.request.url.includes('fonts.googleapis.com') ||
                        event.request.url.includes('fonts.gstatic.com') ||
                        event.request.url.includes('/images/') ||
                        event.request.url.includes('cdn.tailwindcss.com') ||
                        event.request.url.includes('esm.sh') ||
                        event.request.destination === 'document' ||
                        event.request.destination === 'script' ||
                        event.request.destination === 'style';

                    if (shouldCache) {
                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                    }

                    return response;
                });
            })
            .catch(() => {
                // オフライン時の処理
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// PWA インストールバナーの管理
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
