import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types/realEstate';
import { apiGet } from '../lib/api';

export interface OlmaBookingsCountResult {
  activeBookingsCount: number;
  pendingCount: number;
  confirmedCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useOlmaBookingsCount(): OlmaBookingsCountResult {
  const { currentUser, loading: authLoading } = useAuth();
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookingsCount = useCallback(async () => {
    if (!currentUser) {
      setActiveBookingsCount(0);
      setPendingCount(0);
      setConfirmedCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiGet<{ success: boolean; data?: Booking[] }>('/api/v1/real-estate/my-bookings');
      if (res.success && Array.isArray(res.data)) {
        const pending = res.data.filter((b) => b.status === 'pending').length;
        const confirmed = res.data.filter((b) => b.status === 'confirmed').length;
        setPendingCount(pending);
        setConfirmedCount(confirmed);
        setActiveBookingsCount(pending + confirmed);
      }
    } catch {
      // Non-blocking silently on failure
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (authLoading) return;
    fetchBookingsCount();

    const handleUpdate = () => {
      fetchBookingsCount();
    };

    window.addEventListener('olma:bookings-updated', handleUpdate);
    return () => {
      window.removeEventListener('olma:bookings-updated', handleUpdate);
    };
  }, [authLoading, fetchBookingsCount]);

  return {
    activeBookingsCount,
    pendingCount,
    confirmedCount,
    isLoading,
    refresh: fetchBookingsCount,
  };
}
