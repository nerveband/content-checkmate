import { dev } from '$app/environment';

export const PER_IP_DAILY_LIMIT = 5;
export const GLOBAL_DAILY_LIMIT = 100;

function getDateKey(): string {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// In-memory store for local dev (resets on server restart)
const devStore = new Map<string, string>();

interface KVStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

const memoryStore: KVStore = {
  async get(key: string) { return devStore.get(key) ?? null; },
  async set(key: string, value: string) { devStore.set(key, value); }
};

let resolvedStore: KVStore | null = null;
let blobsFailed = false;

function getKVStore(): KVStore {
  if (dev || blobsFailed) {
    return memoryStore;
  }
  if (resolvedStore) {
    return resolvedStore;
  }
  // Lazy-init wrapper that tries Netlify Blobs, falls back to in-memory
  return {
    async get(key: string) {
      if (!resolvedStore) {
        try {
          const { getStore } = await import('@netlify/blobs');
          resolvedStore = getStore('rate-limits') as unknown as KVStore;
        } catch {
          console.warn('Netlify Blobs unavailable, using in-memory rate limiting');
          blobsFailed = true;
          resolvedStore = memoryStore;
        }
      }
      return resolvedStore!.get(key);
    },
    async set(key: string, value: string) {
      if (!resolvedStore) {
        try {
          const { getStore } = await import('@netlify/blobs');
          resolvedStore = getStore('rate-limits') as unknown as KVStore;
        } catch {
          console.warn('Netlify Blobs unavailable, using in-memory rate limiting');
          blobsFailed = true;
          resolvedStore = memoryStore;
        }
      }
      return resolvedStore!.set(key, value);
    }
  };
}

async function getCount(store: KVStore, key: string): Promise<number> {
  try {
    const val = await store.get(key);
    if (val === null) return 0;
    return parseInt(val, 10) || 0;
  } catch {
    return 0;
  }
}

async function setCount(store: KVStore, key: string, count: number): Promise<void> {
  await store.set(key, String(count));
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  globalRemaining: number;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const store = getKVStore();
  const dateKey = getDateKey();
  const ipHash = await hashIP(ip);

  const [ipCount, globalCount] = await Promise.all([
    getCount(store, `ip:${ipHash}:${dateKey}`),
    getCount(store, `global:${dateKey}`)
  ]);

  const ipRemaining = Math.max(0, PER_IP_DAILY_LIMIT - ipCount);
  const globalRemaining = Math.max(0, GLOBAL_DAILY_LIMIT - globalCount);
  const allowed = ipRemaining > 0 && globalRemaining > 0;

  return {
    allowed,
    remaining: ipRemaining,
    globalRemaining
  };
}

export async function incrementUsage(ip: string): Promise<void> {
  const store = getKVStore();
  const dateKey = getDateKey();
  const ipHash = await hashIP(ip);

  const [ipCount, globalCount] = await Promise.all([
    getCount(store, `ip:${ipHash}:${dateKey}`),
    getCount(store, `global:${dateKey}`)
  ]);

  await Promise.all([
    setCount(store, `ip:${ipHash}:${dateKey}`, ipCount + 1),
    setCount(store, `global:${dateKey}`, globalCount + 1)
  ]);
}

export async function getUsageForIP(ip: string): Promise<{ remaining: number; limit: number; allowed: boolean }> {
  const { allowed, remaining } = await checkRateLimit(ip);
  return {
    remaining,
    limit: PER_IP_DAILY_LIMIT,
    allowed
  };
}
