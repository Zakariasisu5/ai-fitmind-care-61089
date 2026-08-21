const CACHE_NAME = 'fitmind-v2';
const OFFLINE_URL = '/offline.html';

const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Never intercept non-GET requests (POST/PUT/DELETE auth + API calls)
  if (event.request.method !== 'GET') {
    return;
  }

  // Always bypass Supabase auth/functions/realtime — these must hit the network directly
  const url = event.request.url;
  if (
    url.includes('supabase.co/auth/') ||
    url.includes('supabase.co/functions/') ||
    url.includes('supabase.co/realtime/') ||
    url.includes('/~oauth')
  ) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Network-first strategy for API calls
  if (event.request.url.includes('/functions/') || event.request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-health-data') {
    event.waitUntil(syncHealthData());
  }
});

async function syncHealthData() {
  console.log('[ServiceWorker] Syncing health data...');
  
  // Get pending data from IndexedDB
  const db = await openDB();
  const tx = db.transaction('pending_sync', 'readonly');
  const store = tx.objectStore('pending_sync');
  const pendingData = await store.getAll();
  
  // Sync each pending item
  for (const item of pendingData) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: JSON.stringify(item.data),
      });
      
      if (response.ok) {
        // Remove from pending queue
        const deleteTx = db.transaction('pending_sync', 'readwrite');
        const deleteStore = deleteTx.objectStore('pending_sync');
        await deleteStore.delete(item.id);
      }
    } catch (error) {
      console.error('[ServiceWorker] Sync failed for item:', item.id, error);
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FitMindDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending_sync')) {
        db.createObjectStore('pending_sync', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('health_data')) {
        db.createObjectStore('health_data', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('mood_entries')) {
        db.createObjectStore('mood_entries', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
