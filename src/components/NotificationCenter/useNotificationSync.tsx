import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiPost } from '../../lib/api';
import { NotificationItem, RawDirectNotif } from './notification.types';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const useNotificationSync = () => {
  const { currentUser, userProfile } = useAuth();
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'fr').substring(0, 2) as 'fr' | 'ar' | 'en';

  const [directNotifs, setDirectNotifs] = useState<NotificationItem[]>([]);
  const [orderNotifs, setOrderNotifs] = useState<NotificationItem[]>([]);
  const isFirstLoadRef = useRef(true);
  const knownIdsRef = useRef<Set<string>>(new Set());

  // Helper to parse timestamps
  const parseTs = (val: unknown): number => {
    if (!val) return Date.now();
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return Date.parse(val) || Date.now();
    if (val && typeof val === 'object') {
      const obj = val as { seconds?: number; _seconds?: number };
      if (obj.seconds) return obj.seconds * 1000;
      if (obj._seconds) return obj._seconds * 1000;
    }
    return Date.now();
  };

  // Real-time Firestore listener on user_notifications collection
  useEffect(() => {
    if (!currentUser) {
      setDirectNotifs([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'user_notifications'),
        where('recipientId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(25)
      );

      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const items: NotificationItem[] = snapshot.docs.map((d) => {
            const data = d.data() as RawDirectNotif;
            const ts = parseTs(data.createdAt);
            const timeStr = new Date(ts).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const title =
              typeof data.title === 'string'
                ? data.title
                : data.title?.[lang] || data.title?.fr || 'Notification';
            const desc =
              typeof data.message === 'string'
                ? data.message
                : data.message?.[lang] || data.message?.fr || '';

            // Route destination based on role and notification type
            let targetLink = '/dashboard/buyer';
            const isSeller = userProfile?.role === 'seller';
            const oId = data.orderId;

            if (data.type === 'new_order') {
              targetLink = isSeller ? '/seller/orders' : (oId ? `/orders/${oId}` : '/dashboard/buyer');
            } else if (data.type === 'new_message' || data.type === 'message') {
              targetLink = oId ? `/orders/${oId}` : (isSeller ? '/seller/orders' : '/dashboard/buyer');
            } else if (data.type === 'order_status') {
              targetLink = oId ? `/orders/${oId}` : '/dashboard/buyer';
            } else if (data.type === 'dispute') {
              targetLink = isSeller ? '/seller/disputes' : (oId ? `/orders/${oId}` : '/dashboard/buyer');
            }

            return {
              id: d.id,
              title,
              description: desc,
              time: timeStr,
              createdAt: ts,
              type: (data.type as NotificationItem['type']) || 'system',
              link: targetLink,
              orderId: data.orderId,
              read: Boolean(data.read),
            };
          });

          // Check for newly arrived unread notifications to alert user
          if (!isFirstLoadRef.current) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const addedData = change.doc.data() as RawDirectNotif;
                if (!addedData.read && !knownIdsRef.current.has(change.doc.id)) {
                  knownIdsRef.current.add(change.doc.id);
                  const tText =
                    typeof addedData.title === 'string'
                      ? addedData.title
                      : addedData.title?.[lang] || addedData.title?.fr || 'Nouvelle notification';
                  const dText =
                    typeof addedData.message === 'string'
                      ? addedData.message
                      : addedData.message?.[lang] || addedData.message?.fr || '';

                  // Show In-App Toast
                  toast(
                    () => (
                      <div className="flex flex-col gap-0.5 text-left">
                        <p className="font-bold text-xs text-stone-900">{tText}</p>
                        <p className="text-[11px] text-stone-600 line-clamp-1">{dText}</p>
                      </div>
                    ),
                    { icon: '🔔', duration: 4500 }
                  );

                  // Native Push if permission granted
                  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                    try {
                      new Notification(tText, { body: dText, icon: '/icon.png' });
                    } catch {
                      // ignore
                    }
                  }
                }
              }
            });
          }

          snapshot.docs.forEach((doc) => knownIdsRef.current.add(doc.id));
          isFirstLoadRef.current = false;
          setDirectNotifs(items);
        },
        (err) => {
          console.warn('Live notifications subscription fallback:', err);
        }
      );

      return () => unsub();
    } catch {
      // Fallback
    }
  }, [currentUser, lang, userProfile?.role]);

  // Fetch orders and system notifications
  const fetchOrdersSync = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await apiGet<{ orders?: Array<{ id: string; status: string; total: number; updatedAt: unknown }> }>(
        '/api/v1/auth/notifications'
      );
      if (res?.orders) {
        const parsed = res.orders.map((o) => {
          const ts = parseTs(o.updatedAt);
          const time = new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          return {
            id: `order-status-${o.id}`,
            title: `Commande #${o.id.substring(0, 8).toUpperCase()}`,
            description: `Statut actuel : ${o.status}`,
            time,
            createdAt: ts,
            type: 'order_status' as const,
            link: `/orders/${o.id}`,
            orderId: o.id,
            read: localStorage.getItem(`notif_read_order-status-${o.id}`) === 'true',
          };
        });
        setOrderNotifs(parsed);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrdersSync();
  }, [fetchOrdersSync]);

  const allNotifications = useMemo(() => {
    const combined = [...directNotifs, ...orderNotifs];
    combined.sort((a, b) => b.createdAt - a.createdAt);
    return combined.slice(0, 30);
  }, [directNotifs, orderNotifs]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.read).length;
  }, [allNotifications]);

  const markAllAsRead = async () => {
    setDirectNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setOrderNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    orderNotifs.forEach((n) => localStorage.setItem(`notif_read_${n.id}`, 'true'));

    try {
      await apiPost('/api/v1/auth/notifications/read-all', {});
    } catch {
      // ignore
    }
  };

  const markOneAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith('order-status-')) {
      localStorage.setItem(`notif_read_${id}`, 'true');
      setOrderNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } else {
      setDirectNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      try {
        await apiPost(`/api/v1/auth/notifications/${id}/read`, {});
      } catch {
        // ignore
      }
    }
  };

  return {
    notifications: allNotifications,
    unreadCount,
    markAllAsRead,
    markOneAsRead,
  };
};
