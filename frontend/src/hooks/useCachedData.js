import { useState, useEffect, useCallback } from "react";
import cachedApi from "../api/cachedApi";

export function useCachedData(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchData = useCallback(async (skipCache = false) => {
    try {
      setLoading(true);
      const response = await cachedApi.get(url, { ...options, skipCache });
      setData(response.data);
      setFromCache(response.fromCache);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(`Failed to fetch ${url}:`, err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return { data, loading, error, fromCache, refresh };
}