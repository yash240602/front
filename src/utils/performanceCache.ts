interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

export const performanceCache = new PerformanceCache();

// Cache keys
export const CACHE_KEYS = {
  HISTORICAL_DATA: (symbol: string) => `historical_${symbol}`,
  WEEKLY_DATA: (symbol: string) => `weekly_${symbol}`,
  MONTHLY_DATA: (symbol: string) => `monthly_${symbol}`,
  VOLATILITY_CALC: (symbol: string) => `volatility_${symbol}`,
} as const; 