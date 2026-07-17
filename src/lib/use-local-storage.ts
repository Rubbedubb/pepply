"use client";

import { useSyncExternalStore } from "react";

const LOCAL_EVENT = "pepply-local-storage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_EVENT, callback);
  };
}

export function useLocalStorageValue(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key),
    () => null,
  );
}

export function writeLocalStorage(key: string, value: string): void {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

export function removeLocalStorage(key: string): void {
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event(LOCAL_EVENT));
}
