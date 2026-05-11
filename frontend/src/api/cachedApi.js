import axiosInstance from "./axiosInstance";
import cacheManager from "./cacheManager";

class CachedApi {
  async get(url, options = {}) {
    const {
      ttl = 5 * 60 * 1000,
      skipCache = false,
      cacheKey = url,
    } = options;

    if (!skipCache) {
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        return { data: cachedData, fromCache: true };
      }
    }

    const response = await axiosInstance.get(url);
    
    if (!skipCache) {
      cacheManager.set(cacheKey, response.data, ttl);
    }

    return { data: response.data, fromCache: false };
  }

  async post(url, data, options = {}) {
    const { invalidatePatterns = [] } = options;
    
    const response = await axiosInstance.post(url, data);
    
    invalidatePatterns.forEach(pattern => {
      cacheManager.removePattern(pattern);
    });

    return response;
  }

  async put(url, data, options = {}) {
    const { invalidatePatterns = [] } = options;
    
    const response = await axiosInstance.put(url, data);
    
    invalidatePatterns.forEach(pattern => {
      cacheManager.removePattern(pattern);
    });

    return response;
  }

  async delete(url, options = {}) {
    const { invalidatePatterns = [] } = options;
    
    const response = await axiosInstance.delete(url);
    
    invalidatePatterns.forEach(pattern => {
      cacheManager.removePattern(pattern);
    });

    return response;
  }

  invalidateCache(patterns) {
    patterns.forEach(pattern => {
      cacheManager.removePattern(pattern);
    });
  }

  clearAllCache() {
    cacheManager.clear();
  }
}

const cachedApi = new CachedApi();

export default cachedApi;