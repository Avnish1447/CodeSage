import crypto from 'node:crypto';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  contentType: string;
  statusCode: number;
  etag: string;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRatioPercentage: number;
  entryCount: number;
  maxEntries: number;
  estimatedMemoryBytes: number;
  evictionCount: number;
}

/**
 * RepeatRequestCacheService
 * Ultra high-performance in-memory cache for repeat idempotent HTTP requests.
 * Features:
 *  - Configurable TTL (Time-To-Live) and max capacity with LRU eviction
 *  - ETag calculation for HTTP 304 Not Modified caching
 *  - Real-time cache hit/miss and efficiency telemetry
 *  - Safe regex/prefix invalidation
 */
export class RepeatRequestCacheService {
  private static store = new Map<string, CacheEntry>();
  private static maxEntries = 1000;
  private static defaultTtlMs = 120_000; // 2 minutes
  private static inflight = new Map<string, Promise<any>>();

  // Telemetry metrics
  private static hits = 0;
  private static misses = 0;
  private static evictionCount = 0;

  /**
   * Atomic Single-Flight cache retrieval.
   * If the key is not in cache, guarantees that multiple simultaneous callers share a single
   * invocation of computeFn() to eliminate cache stampedes / thundering herds.
   */
  static async getOrCompute<T = any>(
    key: string,
    computeFn: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    const existing = this.get<T>(key);
    if (existing) {
      return existing.data;
    }

    if (this.inflight.has(key)) {
      return this.inflight.get(key) as Promise<T>;
    }

    const promise = computeFn()
      .then((data) => {
        this.set(key, data, { ttlMs });
        this.inflight.delete(key);
        return data;
      })
      .catch((err) => {
        this.inflight.delete(key);
        throw err;
      });

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Generates a deterministic cache key from method, URL, and optional payload.
   */
  static generateKey(method: string, url: string, extraKey: string = ''): string {
    const raw = `${method.toUpperCase()}:${url}:${extraKey}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
  }

  /**
   * Generates a weak ETag for body content.
   */
  static generateETag(content: string | Buffer): string {
    const hash = crypto.createHash('md5').update(content).digest('base64').substring(0, 16);
    const length = Buffer.byteLength(content);
    return `W/"${length.toString(16)}-${hash}"`;
  }

  /**
   * Retrieves an item from the cache. Returns null if not found or expired.
   */
  static get<T = any>(key: string): CacheEntry<T> | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    // Cache hit: bump hits and re-insert for LRU ordering
    entry.hits++;
    this.hits++;
    this.store.delete(key);
    this.store.set(key, entry);

    return entry as CacheEntry<T>;
  }

  /**
   * Sets an item in the cache with TTL.
   */
  static set<T = any>(
    key: string,
    data: T,
    options: {
      ttlMs?: number;
      contentType?: string;
      statusCode?: number;
    } = {}
  ): CacheEntry<T> {
    const {
      ttlMs = this.defaultTtlMs,
      contentType = 'application/json; charset=utf-8',
      statusCode = 200,
    } = options;

    const contentStr = typeof data === 'string' ? data : JSON.stringify(data);
    const etag = this.generateETag(contentStr);

    // Evict oldest entries if capacity reached (LRU)
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
        this.evictionCount++;
      }
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      key,
      data,
      contentType,
      statusCode,
      etag,
      createdAt: now,
      expiresAt: now + ttlMs,
      hits: 0,
    };

    this.store.set(key, entry);
    return entry;
  }

  /**
   * Invalidates a specific key or all keys matching a prefix/regex.
   */
  static invalidate(pattern?: string | RegExp): number {
    if (!pattern) {
      const count = this.store.size;
      this.store.clear();
      return count;
    }

    let deleted = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of Array.from(this.store.keys())) {
      if (regex.test(key)) {
        this.store.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Returns telemetry statistics on cache performance.
   */
  static getStats(): CacheStats {
    const totalRequests = this.hits + this.misses;
    const hitRatioPercentage =
      totalRequests > 0 ? parseFloat(((this.hits / totalRequests) * 100).toFixed(1)) : 0;

    // Estimate memory bytes
    let approxBytes = 0;
    for (const [, val] of this.store.entries()) {
      approxBytes += 128 + (val.key.length * 2);
      if (typeof val.data === 'string') {
        approxBytes += val.data.length * 2;
      } else if (val.data) {
        approxBytes += JSON.stringify(val.data).length * 2;
      }
    }

    return {
      hits: this.hits,
      misses: this.misses,
      totalRequests,
      hitRatioPercentage,
      entryCount: this.store.size,
      maxEntries: this.maxEntries,
      estimatedMemoryBytes: approxBytes,
      evictionCount: this.evictionCount,
    };
  }

  /**
   * Resets metrics.
   */
  static resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictionCount = 0;
  }
}
