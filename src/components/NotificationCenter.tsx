import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNotificationSync } from './NotificationCenter/useNotificationSync';
import { NotificationItemCard } from './NotificationCenter/NotificationItemCard';
import { NotificationItem } from './NotificationCenter/notification.types';

export const NotificationCenter: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAllAsRead, markOneAsRead } = useNotificationSync();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (item: NotificationItem) => {
    setIsOpen(false);
    if (!item.read) {
      markOneAsRead(item.id, { stopPropagation: () => {} } as React.MouseEvent);
    }
    navigate(item.link);
  };

  const displayedNotifications = filter === 'unread' 
    ? notifications.filter((n) => !n.read) 
    : notifications;

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100/80 hover:bg-stone-200/80 text-stone-700 hover:text-stone-900 transition-colors relative cursor-pointer"
        title={t("Notifications")}
        aria-label="Centre de notifications"
      >
        <Bell className="w-5 h-5 stroke-[1.7]" />

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-600 border-2 border-white text-[9px] text-white font-extrabold items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Solid Opaque Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                  {t("Notifications")}
                </h4>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                    {unreadCount}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{t("Tout marquer comme lu")}</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-stone-100 bg-white">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {t("Toutes")} ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {t("Non lues")} ({unreadCount})
              </button>
            </div>

            {/* Notification Items List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100">
              {displayedNotifications.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-stone-600">
                    {filter === 'unread' ? t("Aucune notification non lue") : t("Aucune notification pour le moment")}
                  </p>
                </div>
              ) : (
                displayedNotifications.map((item) => (
                  <NotificationItemCard
                    key={item.id}
                    item={item}
                    onClick={handleNotificationClick}
                    onMarkAsRead={markOneAsRead}
                  />
                ))
              )}
            </div>

            {/* Footer Quick Link */}
            <div className="p-2.5 bg-stone-50/80 border-t border-stone-100 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(
                    userProfile?.role === 'seller' ? '/seller/orders' : currentUser ? '/dashboard/buyer' : '/auth'
                  );
                }}
                className="text-[11px] font-semibold text-stone-700 hover:text-orange-600 transition-colors w-full py-1 cursor-pointer"
              >
                {userProfile?.role === 'seller'
                  ? t("Gérer les commandes vendeurs →")
                  : t("Voir mon tableau de bord →")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
