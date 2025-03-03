// Service Worker untuk Waktu Solat App
const CACHE_NAME = 'waktu-solat-cache-v1';
const OFFLINE_URL = '/offline.html';

// Daftar aset yang akan di-cache saat instalasi
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Event saat service worker diinstal
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache dibuka');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Force service worker untuk mengaktifkan diri segera
        return self.skipWaiting();
      })
  );
});

// Event saat service worker diaktifkan
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Hapus cache lama yang tidak digunakan
          if (cacheName !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Ambil alih halaman yang sudah terbuka
      return self.clients.claim();
    })
  );
});

// Event saat ada permintaan fetch
self.addEventListener('fetch', (event) => {
  // Hanya tangani permintaan GET
  if (event.request.method !== 'GET') return;

  // Tangani permintaan API secara khusus
  if (event.request.url.includes('/api/')) {
    handleApiRequest(event);
    return;
  }

  // Strategi Cache First untuk aset statis
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Gunakan cache jika tersedia
        if (response) {
          return response;
        }

        // Jika tidak ada di cache, ambil dari jaringan
        return fetch(event.request)
          .then((networkResponse) => {
            // Jangan cache respons dari API
            if (
              !event.request.url.startsWith('http') || 
              event.request.url.includes('/api/')
            ) {
              return networkResponse;
            }

            // Salin respons untuk disimpan di cache
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Jika offline dan meminta halaman HTML, tampilkan halaman offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Fungsi untuk menangani permintaan API
function handleApiRequest(event) {
  event.respondWith(
    // Coba ambil dari jaringan terlebih dahulu
    fetch(event.request)
      .then((response) => {
        // Salin respons untuk disimpan di cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            // Simpan respons API dengan waktu kedaluwarsa
            const headers = new Headers(responseToCache.headers);
            headers.append('sw-fetched-on', new Date().toISOString());
            
            // Buat respons baru dengan header tambahan
            return responseToCache.blob().then(body => {
              return cache.put(event.request, new Response(body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              }));
            });
          });
        
        return response;
      })
      .catch(() => {
        // Jika offline, coba ambil dari cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              // Periksa waktu kedaluwarsa cache
              const fetchedOn = new Date(
                cachedResponse.headers.get('sw-fetched-on')
              );
              const now = new Date();
              
              // Jika cache kurang dari 1 jam, gunakan
              if (now.getTime() - fetchedOn.getTime() < 60 * 60 * 1000) {
                return cachedResponse;
              }
            }
            
            // Jika tidak ada cache atau sudah kedaluwarsa, kembalikan respons error
            return new Response(JSON.stringify({
              error: 'Tidak dapat terhubung ke server. Anda sedang offline.'
            }), {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
  );
}

// Event untuk sinkronisasi latar belakang
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-prayer-times') {
    event.waitUntil(syncPrayerTimes());
  }
});

// Fungsi untuk sinkronisasi data waktu sholat
function syncPrayerTimes() {
  // Implementasi sinkronisasi data di sini
  return Promise.resolve();
} 