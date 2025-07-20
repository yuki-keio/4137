const CACHE_NAME = '4137-game-v1.0.4';
const CRITICAL_CACHE = '4137-critical-v1.0.4';

// Critical resources for LCP optimization
const criticalResources = [
    '/',
    '/index.html',
    '/images/4137.png'
];

// Secondary resources
const secondaryResources = [
    '/index.css',
    '/images/icon-192.png',
    '/images/icon-512.png',
    '/images/v4137.png',
    '/images/smart.png',
    '/images/wide.png',
    '/manifest.json'
];

// Service Worker のインストール - Critical resources first
self.addEventListener('install', (event) => {
    self.skipWaiting();

    event.waitUntil(
        Promise.all([
            // Critical resources first for LCP
            caches.open(CRITICAL_CACHE).then((cache) => {
                return cache.addAll(criticalResources);
            }),
            // Secondary resources can wait
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(secondaryResources);
            })
        ]).catch((error) => {
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
                        if (cacheName !== CACHE_NAME && cacheName !== CRITICAL_CACHE) {
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

// リクエストの処理 - Critical resources prioritized
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Critical resources - check critical cache first
    if (criticalResources.some(resource => url.pathname === resource || url.pathname.endsWith(resource))) {
        event.respondWith(
            caches.match(event.request, { cacheName: CRITICAL_CACHE })
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    // Fallback to network with critical priority
                    return fetch(event.request, { priority: 'high' }).catch(() => {
                        return caches.match(event.request);
                    });
                })
        );
        return;
    }

    // Regular fetch strategy for non-critical resources
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
                        const targetCache = criticalResources.some(resource =>
                            url.pathname === resource || url.pathname.endsWith(resource)
                        ) ? CRITICAL_CACHE : CACHE_NAME;

                        caches.open(targetCache)
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
});

// PWA インストールバナーの管理
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
