import { useEffect, useState } from 'react';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasPendingSync, setHasPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
        navigator.serviceWorker.ready.then((registration) => {
          return (registration as any).sync.register('sync-health-data');
        });
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueForSync = async (url: string, method: string, data: any, headers: Record<string, string>) => {
    if (!('indexedDB' in window)) return false;

    try {
      const db = await openDB();
      const tx = db.transaction('pending_sync', 'readwrite');
      const store = tx.objectStore('pending_sync');
      
      await store.add({
        url,
        method,
        data,
        headers,
        timestamp: new Date().toISOString(),
      });

      setHasPendingSync(true);
      return true;
    } catch (error) {
      console.error('Error queuing data for sync:', error);
      return false;
    }
  };

  return { isOnline, hasPendingSync, queueForSync };
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FitMindDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
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
