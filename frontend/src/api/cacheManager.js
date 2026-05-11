const CACHE_PREFIX = 'lms_cache_';
const DEFAULT_TTL = 5 * 60 * 1000;

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
  }

  set(key, data, ttl = DEFAULT_TTL) {
    const cacheKey = CACHE_PREFIX + key;
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.memoryCache.set(cacheKey, cacheData);

    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  get(key) {
    const cacheKey = CACHE_PREFIX + key;
    
    if (this.memoryCache.has(cacheKey)) {
      const cacheData = this.memoryCache.get(cacheKey);
      if (this.isValid(cacheData)) {
        return cacheData.data;
      }
      this.remove(key);
      return null;
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const cacheData = JSON.parse(stored);
        if (this.isValid(cacheData)) {
          this.memoryCache.set(cacheKey, cacheData);
          return cacheData.data;
        }
        this.remove(key);
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }

    return null;
  }

  remove(key) {
    const cacheKey = CACHE_PREFIX + key;
    this.memoryCache.delete(cacheKey);
    try {
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.warn('Failed to remove from localStorage:', e);
    }
  }

  removePattern(pattern) {
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX) && key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to remove pattern from localStorage:', e);
    }
  }

  clear() {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  }

  isValid(cacheData) {
    return Date.now() - cacheData.timestamp < cacheData.ttl;
  }
}

const cacheManager = new CacheManager();

export default cacheManager;