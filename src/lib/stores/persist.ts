import { PersistOptions, StorageValue } from "zustand/middleware";

export const createLocalStoragePersist = <
  T
>(): PersistOptions<T>["storage"] => ({
  getItem: (key: string) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  setItem: (key: string, value: StorageValue<T>) => {
    if (value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
});
