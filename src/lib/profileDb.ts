import { Profile } from '@/types';

// Minimal IndexedDB helpers for Profile caching
function openProfileDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ProfileDB', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('profiles', { keyPath: 'address' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getProfileFromDB(
  address: string
): Promise<Profile | undefined> {
  const db = await openProfileDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('profiles', 'readonly');
    const store = tx.objectStore('profiles');
    const req = store.get(address);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function setProfilesToDB(profiles: Profile[]) {
  const db = await openProfileDB();
  const tx = db.transaction('profiles', 'readwrite');
  const store = tx.objectStore('profiles');
  for (const profile of profiles) {
    store.put(profile);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
}
