import { useState, useEffect } from "react";
import { safeParseStorage, setSafeStorage } from "./storageGuard";

export function useSharedState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize from storage or fallback to initialValue
  const [state, setState] = useState<T>(() => safeParseStorage<T>(key, initialValue));

  useEffect(() => {
    // Primary Sync: BroadcastChannel (with feature detection)
    let channel: BroadcastChannel | null = null;
    let handleMessage: ((event: MessageEvent) => void) | null = null;

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("chronos_state_sync");
      handleMessage = (event: MessageEvent) => {
        if (event.data.key === key) {
          const val = event.data.value;
          if (Array.isArray(initialValue) && !Array.isArray(val)) return;
          setState(val);
        }
      };
      channel.addEventListener("message", handleMessage);
    }

    // Fallback Sync: Storage Event
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          // Assuming v2 schema { version: 2, data: ... }
          if (parsed.data !== undefined) {
            if (Array.isArray(initialValue) && !Array.isArray(parsed.data)) return;
            setState(parsed.data);
          }
        } catch(e) {
          // fallback
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel && handleMessage) {
        channel.removeEventListener("message", handleMessage);
        channel.close();
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, [key]);

  const setSharedState = (value: T | ((val: T) => T)) => {
    setState((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      // Persist locally
      setSafeStorage(key, newValue);
      // Broadcast to other tabs immediately (with feature detection)
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel("chronos_state_sync");
        channel.postMessage({ key, value: newValue });
        channel.close();
      }
      return newValue;
    });
  };

  return [state, setSharedState];
}
