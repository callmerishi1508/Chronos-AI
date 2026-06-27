/**
 * Storage Guard Utility
 * Ensures that corrupted JSON or outdated schemas in localStorage do not crash the application.
 * Automatically repairs data and supports schema migrations.
 */

import { logger } from "./logger";

export const CURRENT_SCHEMA_VERSION = 2;
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface StorageWrapper<T> {
  version: number;
  timestamp?: number;
  checksum?: number;
  data: T;
}

// Simple fast string hash to detect accidental corruption
function computeChecksum(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function migrateStorage<T>(key: string, parsedRaw: any, fallback: T): T {
  if (!parsedRaw) return fallback;

  // Case 1: Old v1 unversioned data
  if (parsedRaw.version === undefined) {
    logger.info(`[Storage Guard] Migrating ${key} from v1 to v2 schema.`);
    setSafeStorage(key, parsedRaw);
    return parsedRaw as T;
  }

  // Check TTL (Expiry)
  if (parsedRaw.timestamp && Date.now() - parsedRaw.timestamp > DEFAULT_TTL_MS) {
    logger.warn(`[Storage Guard] Data for ${key} expired (TTL exceeded). Flushed.`);
    localStorage.removeItem(key);
    return fallback;
  }

  // Validate Checksum (Accidental Corruption)
  if (parsedRaw.checksum !== undefined && parsedRaw.data !== undefined) {
    const computed = computeChecksum(JSON.stringify(parsedRaw.data));
    if (computed !== parsedRaw.checksum) {
      logger.error(`[Storage Guard] Checksum mismatch for ${key}. Data corrupted.`);
      throw new Error("Checksum mismatch"); // trigger catch block in safeParseStorage
    }
  }

  // Case 2: Future version or exact match
  if (parsedRaw.version === CURRENT_SCHEMA_VERSION) {
    return parsedRaw.data as T;
  }

  // Fallback for extreme cases
  return parsedRaw.data || fallback;
}

export function safeParseStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    
    // Attempt parse
    const parsed = JSON.parse(item);
    
    // Validate schema
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error("Invalid structure");
    }

    // Pass through migration layer
    return migrateStorage<T>(key, parsed, fallback);

  } catch (error) {
    logger.warn(`[Storage Guard] Recovered from corrupted storage at key '${key}'. Falling back to default.`);
    localStorage.removeItem(key);
    return fallback;
  }
}

export function setSafeStorage<T>(key: string, data: T) {
  try {
    const payload: StorageWrapper<T> = {
      version: CURRENT_SCHEMA_VERSION,
      timestamp: Date.now(),
      checksum: computeChecksum(JSON.stringify(data)),
      data
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    logger.error(`[Storage Guard] Failed to write to storage at key '${key}'. Quota exceeded?`, error);
  }
}
