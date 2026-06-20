import type { PersistStorage, StorageValue } from 'zustand/middleware';

const memoryStorage = new Map<string, string>();

function getLocalStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  const candidate = window.localStorage;

  if (
    candidate &&
    typeof candidate.getItem === 'function' &&
    typeof candidate.setItem === 'function' &&
    typeof candidate.removeItem === 'function'
  ) {
    return candidate;
  }

  return null;
}

export function createBrowserPersistStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      const storage = getLocalStorage();
      const value = storage?.getItem(name) ?? memoryStorage.get(name) ?? null;
      return value ? (JSON.parse(value) as StorageValue<T>) : null;
    },
    setItem: (name, value) => {
      const storage = getLocalStorage();
      const serialized = JSON.stringify(value);
      if (storage) {
        storage.setItem(name, serialized);
        return;
      }

      memoryStorage.set(name, serialized);
    },
    removeItem: (name) => {
      const storage = getLocalStorage();
      if (storage) {
        storage.removeItem(name);
        return;
      }

      memoryStorage.delete(name);
    },
  };
}
