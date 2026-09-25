import { RepoResponse, CachedAnalysisSummary } from '../types';

const DB_NAME = 'CodeSage_Cache_v1';
const DB_VERSION = 1;
const STORE_NAME = 'analyses';

class IndexedDbService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isSupported()) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'repository_id' });
            store.createIndex('by_url', 'overview.normalized_url', { unique: false });
            store.createIndex('by_timestamp', 'cached_at', { unique: false });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          this.dbPromise = null;
          reject(request.error || new Error('Failed to open IndexedDB.'));
        };

        request.onblocked = () => {
          console.warn('[IndexedDbService] Database open blocked by another tab.');
        };
      } catch (err) {
        this.dbPromise = null;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  /**
   * Normalizes repository URL for consistent key matching
   */
  private cleanUrl(url: string): string {
    return url.trim().replace(/\.git$/i, '').replace(/\/+$/, '').toLowerCase();
  }

  /**
   * Retrieves an analysis result directly from client-side IndexedDB in < 5ms
   */
  async getCachedAnalysis(url: string, branch: string = 'main'): Promise<RepoResponse | null> {
    if (!this.isSupported()) return null;

    try {
      const db = await this.getDB();
      const targetUrl = this.cleanUrl(url);
      const targetBranch = branch.trim().toLowerCase();

      return new Promise<RepoResponse | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const val = cursor.value as RepoResponse;
            const itemUrl = this.cleanUrl(val.overview?.normalized_url || '');
            const itemBranch = (val.overview?.branch || 'main').toLowerCase();

            if (itemUrl === targetUrl && itemBranch === targetBranch) {
              resolve({
                ...val,
                from_cache: true,
                cache_source: 'indexeddb',
              });
              return;
            }
            cursor.continue();
          } else {
            resolve(null);
          }
        };

        request.onerror = () => resolve(null);
      });
    } catch (err: any) {
      console.warn('[IndexedDbService] Error reading from cache:', err.message);
      return null;
    }
  }

  /**
   * Saves or updates a completed repository analysis in IndexedDB
   */
  async saveAnalysisToCache(data: RepoResponse): Promise<void> {
    if (!this.isSupported() || !data?.repository_id) return;

    try {
      const db = await this.getDB();
      const record: RepoResponse = {
        ...data,
        cached_at: Date.now(),
        from_cache: true,
        cache_source: 'indexeddb',
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err: any) {
      console.warn('[IndexedDbService] Error saving to cache:', err.message);
    }
  }

  /**
   * Lists all cached repositories with file counts and timestamps
   */
  async listAllCachedAnalyses(): Promise<CachedAnalysisSummary[]> {
    if (!this.isSupported()) return [];

    try {
      const db = await this.getDB();
      return new Promise<CachedAnalysisSummary[]>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const list = (request.result || []) as RepoResponse[];
          const summaries: CachedAnalysisSummary[] = list.map((item) => {
            const languages = Object.keys(item.facts?.languages || {});
            const primaryLanguage = languages.length > 0 ? languages[0] : undefined;

            return {
              repository_id: item.repository_id,
              url: item.overview?.normalized_url || '',
              branch: item.overview?.branch || 'main',
              owner: item.overview?.owner || '',
              repo: item.overview?.repo || '',
              files: item.overview?.files || 0,
              size_mb: item.overview?.size_mb || 0,
              primary_language: primaryLanguage,
              cached_at: item.cached_at || Date.now(),
            };
          });

          // Sort by newest first
          summaries.sort((a, b) => b.cached_at - a.cached_at);
          resolve(summaries);
        };

        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  /**
   * Deletes a specific cached repository from IndexedDB
   */
  async deleteCachedAnalysis(repositoryId: string): Promise<void> {
    if (!this.isSupported()) return;

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(repositoryId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err: any) {
      console.warn('[IndexedDbService] Delete error:', err.message);
    }
  }

  /**
   * Clears the entire client-side IndexedDB cache
   */
  async clearAllCache(): Promise<void> {
    if (!this.isSupported()) return;

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err: any) {
      console.warn('[IndexedDbService] Clear error:', err.message);
    }
  }

  /**
   * Estimates storage size and record count in client IndexedDB
   */
  async getCacheStorageSummary(): Promise<{ count: number; totalEstimatedBytes: number }> {
    if (!this.isSupported()) return { count: 0, totalEstimatedBytes: 0 };

    try {
      const db = await this.getDB();
      return new Promise<{ count: number; totalEstimatedBytes: number }>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const items = request.result || [];
          let bytes = 0;
          try {
            const raw = JSON.stringify(items);
            bytes = new Blob([raw]).size;
          } catch {
            bytes = items.length * 1024 * 12; // Rough estimate
          }
          resolve({ count: items.length, totalEstimatedBytes: bytes });
        };

        request.onerror = () => resolve({ count: 0, totalEstimatedBytes: 0 });
      });
    } catch {
      return { count: 0, totalEstimatedBytes: 0 };
    }
  }
}

export const indexedDbService = new IndexedDbService();
