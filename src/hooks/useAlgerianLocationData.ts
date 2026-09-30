import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CommuneInfo,
  loadAlgerianCommunesDatabase,
  getCommunesForWilaya,
  getDairasForWilaya,
  getCommunesForDaira,
} from '../data/algerianCommunesDatabase';

interface UseAlgerianLocationOptions {
  /** If true, loading is deferred until triggerLoad() is invoked */
  lazy?: boolean;
}

export interface UseAlgerianLocationResult {
  dairas: string[];
  communes: CommuneInfo[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  preloadLocationData: () => Promise<void>;
}

export function useAlgerianLocationData(
  wilaya?: string,
  daira?: string,
  options: UseAlgerianLocationOptions = {}
): UseAlgerianLocationResult {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const preloadLocationData = useCallback(async () => {
    if (isLoaded || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      await loadAlgerianCommunesDatabase();
      setIsLoaded(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  useEffect(() => {
    // If not lazy, or if a wilaya has been chosen by the user, load the dataset
    if (!options.lazy || (wilaya && wilaya !== 'all')) {
      void preloadLocationData();
    }
  }, [options.lazy, wilaya, preloadLocationData]);

  const dairas = useMemo(() => {
    if (!isLoaded || !wilaya || wilaya === 'all') return [];
    return getDairasForWilaya(wilaya);
  }, [wilaya, isLoaded]);

  const communes = useMemo(() => {
    if (!isLoaded || !wilaya || wilaya === 'all') return [];
    if (daira && daira !== 'all') {
      return getCommunesForDaira(wilaya, daira);
    }
    return getCommunesForWilaya(wilaya);
  }, [wilaya, daira, isLoaded]);

  return {
    dairas,
    communes,
    isLoading,
    isLoaded,
    error,
    preloadLocationData,
  };
}
