import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, MessageSquare, Truck, Check, ShieldCheck, Ticket, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost } from "../lib/api";
import toast from "react-hot-toast";
import { formatPrice } from "../utils/format";
import { useTranslation } from "react-i18next";

interface NotifOrder {
  id: string;
  status: string;
  total?: number;
  updatedAt?: unknown;
}

interface NotifCoupon {
  id: string;
  code?: string;
  discountType?: string;
  discountValue?: number;
  minOrderValue?: number;
  createdAt?: unknown;
}

interface NotifDirect {
  id: string;
  type?: string;
  createdAt?: unknown;
  title?: string | Record<string, string>;
  message?: string | Record<string, string>;
  read?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  createdAt: number;
  type:
    | "message"
    | "status_shipped"
    | "status_delivered"
    | "support"
    | "coupon"
    | "system"
    | "new_order"
    | "dispute"
    | "withdrawal";
  link: string;
  read: boolean;
}

const parseTimestamp = (val: unknown): number => {
  if (!val) return Date.now();
  if (typeof val === "number") return val;
  if (typeof val === "string") return Date.parse(val) || Date.now();
  if (val && typeof val === "object") {
    const obj = val as { seconds?: number; _seconds?: number };
    if (obj.seconds) return obj.seconds * 1000;
    if (obj._seconds) return obj._seconds * 1000;
  }
  return Date.now();
};

export const NotificationCenter: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [orderNotifications, setOrderNotifications] = useState<NotificationItem[]>([]);
  const [directNotifications, setDirectNotifications] = useState<NotificationItem[]>([]);
  const [globalCoupons, setGlobalCoupons] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  const requestPushPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
        if (perm === "granted") {
          toast.success("Notifications activées ! 🔔");
          try {
            new Notification("Notifications activées", {
              body: "Vous recevrez des alertes en temps réel sur Olmart.",
              icon: "/icon.png",
            });
          } catch (e) {
            console.warn("Could not fire test notification", e);
          }
        }
      });
    }
  };

  // Parse active language
  const lang = (i18n.language || "fr").substring(0, 2) as "fr" | "en" | "ar";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = React.useCallback(async (isFirstLoad = false) => {
    if (!currentUser) return;
    try {
      const response = await apiGet<{
        orders: NotifOrder[];
        direct: NotifDirect[];
        coupons: NotifCoupon[];
      }>("/api/v1/auth/notifications");

      if (!response) return;

      // 1. Process orders
      const newOrdersNotif: NotificationItem[] = [];
      (response.orders || []).forEach((order: NotifOrder) => {
        const orderIdShort = order.id.substring(0, 8);
        const orderTimeMs = parseTimestamp(order.updatedAt);
        const orderTime = new Date(orderTimeMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (order.status === "shipped") {
          newOrdersNotif.push({
            id: `shipped-${order.id}`,
            title: t("notif.shipped_title") || `🚨 Ça arrive !`,
            description: `${t("notif.shipped_desc") || "L'artisan a remis votre colis au livreur. Préparez les "}${formatPrice(order.total || 0)}${t(" en espèces.")}`,
            time: orderTime,
            createdAt: orderTimeMs,
            type: "status_shipped" as const,
            link: `/dashboard/buyer`,
            read: localStorage.getItem(`notif_read_shipped-${order.id}`) === "true",
          });
        } else if (order.status === "delivered") {
          newOrdersNotif.push({
            id: `delivered-${order.id}`,
            title: t("notif.delivered_title") || `📍 Le livreur est là !`,
            description: `${t("notif.delivered_desc") || "Gardez votre téléphone près de vous aujourd'hui pour réceptionner votre commande #"}${orderIdShort}.`,
            time: orderTime,
            createdAt: orderTimeMs,
            type: "status_delivered" as const,
            link: `/dashboard/buyer`,
            read: localStorage.getItem(`notif_read_delivered-${order.id}`) === "true",
          });
        } else {
          newOrdersNotif.push({
            id: `pending-${order.id}`,
            title: `${t("notif.order_recorded") || "Commande #"} ${orderIdShort} ${t("notif.registered") || "Enregistrée"}`,
            description: t("notif.pending_desc") || `Le vendeur prépare votre colis en paiement CASH à la livraison.`,
            time: orderTime,
            createdAt: orderTimeMs,
            type: "system" as const,
            link: `/dashboard/buyer`,
            read: localStorage.getItem(`notif_read_pending-${order.id}`) === "true",
          });
        }
      });

      // Also support custom static user notifications
      newOrdersNotif.push({
        id: "support-hub",
        title: t("notif.support_title") || "Messagerie Olma active 💬",
        description: t("notif.support_desc") || "Échangez directement avec les artisans depuis le suivi de commande.",
        time: t("notif.permanent") || "Permanent",
        createdAt: Date.now(),
        type: "message" as const,
        link: "/dashboard/buyer",
        read: localStorage.getItem("notif_read_support-hub") === "true",
      });

      setOrderNotifications(newOrdersNotif);

      // 2. Process direct notifications
      const newDirectNotif: NotificationItem[] = (response.direct || []).map((data: NotifDirect) => {
        const timeMs = parseTimestamp(data.createdAt);
        const timeStr = new Date(timeMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const titleText = data.title ? (typeof data.title === "string" ? data.title : data.title[lang] || data.title.fr || "") : "Notification";
        const descText = data.message ? (typeof data.message === "string" ? data.message : data.message[lang] || data.message.fr || "") : "";

        let computedLink: string;
        if (userProfile?.role === "seller") {
          computedLink = "/dashboard/seller";
          if (data.type === "new_order" || data.type === "order") {
            computedLink = "/dashboard/seller/orders";
          } else if (data.type === "support" || data.type === "message") {
            computedLink = "/dashboard/seller/support";
          }
        } else {
          computedLink = "/dashboard/buyer";
        }

        const notifId = `user-notif-${data.id}`;

        // Direct Native push notification trigger for unread & unseen yet
        if (!isFirstLoad && !data.read && !notifiedIdsRef.current.has(notifId)) {
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(typeof titleText === "string" ? titleText : "Nouvelle alerte", {
                body: typeof descText === "string" ? descText : "Vous avez une nouvelle notification.",
                icon: "/icon.png",
                badge: "/icon.png",
              });
            } catch (err) {
              console.warn("Failed sending native push", err);
            }
          }
        }

        // Add to notified reference set
        notifiedIdsRef.current.add(notifId);

        return {
          id: notifId,
          title: titleText,
          description: descText,
          time: timeStr,
          createdAt: timeMs,
          type: (data.type as NotificationItem["type"]) || "system",
          link: computedLink,
          read: data.read === true,
        };
      });

      setDirectNotifications(newDirectNotif);

      // 3. Process coupons
      const newCouponsNotif: NotificationItem[] = (response.coupons || []).map((data: NotifCoupon): NotificationItem => {
        const timeMs = parseTimestamp(data.createdAt);
        const timeStr = new Date(timeMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        let discountDisplay: string;
        if (data.discountType === "percentage") {
          discountDisplay = `${data.discountValue}%`;
        } else {
          discountDisplay = `${data.discountValue} DA`;
        }

        return {
          id: `global-coupon-${data.id}`,
          title: t("notification.new_coupon_title", "🎁 Nouveau Code Promo : {{code}}", { code: data.code }),
          description: t(
            "notification.new_coupon_desc",
            "Profitez de {{discount}} de réduction ! (Min. {{min}} DA)",
            { discount: discountDisplay, min: data.minOrderValue || 0 }
          ),
          time: timeStr,
          createdAt: timeMs,
          type: "coupon" as const,
          link: "/shop",
          read: localStorage.getItem(`notif_read_global-coupon-${data.id}`) === "true",
        };
      });

      setGlobalCoupons(newCouponsNotif);

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn("NotificationCenter: Unable to fetch online notifications, using fallback:", errMsg);
    }
  }, [currentUser, lang, userProfile?.role, t]);

  // Sync / Fetch live firebase events
  useEffect(() => {
    if (!currentUser) {
      // Offline fallback notifications (e.g., campaign info, platform system messages)
      setOrderNotifications([
        {
          id: "welcome-off",
          title: t("notif.welcome_title") || "Bienvenue sur Olma 🇩🇿",
          description:
            t("notif.welcome_desc") || "La marketplace des créations de nos 58 Wilayas. Vos achats sont protégés.",
          time: t("A l'instant"),
          createdAt: Date.now(),
          type: "system" as const,
          link: "/shop",
          read: false,
        },
        {
          id: "promo-off",
          title: t("notif.promo_title") || "Livraison Offerte",
          description: t("notif.promo_desc") || "Profitez de réductions exclusives de la part des vendeurs !",
          time: t("notif.two_hours_ago") || "Il y a 2h",
          createdAt: Date.now() - 7200000,
          type: "coupon" as const,
          link: "/shop",
          read: false,
        },
      ]);
      setDirectNotifications([]);
      return;
    }

    // Initial load
    fetchNotifications(true);

    // Set up a polling interval for background updates every 60 seconds
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUser, fetchNotifications, t]);

  // Combined notifications memo sorted chronologically
  const notifications = useMemo(() => {
    const all = [...directNotifications, ...orderNotifications, ...globalCoupons];
    all.sort((a, b) => b.createdAt - a.createdAt);
    return all.slice(0, 50);
  }, [orderNotifications, directNotifications, globalCoupons]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAllAsRead = async () => {
    // 1. Local storage read state for order updates and global coupons
    orderNotifications.forEach((n) => {
      localStorage.setItem(`notif_read_${n.id}`, "true");
    });
    globalCoupons.forEach((n) => {
      localStorage.setItem(`notif_read_${n.id}`, "true");
    });
    setOrderNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setGlobalCoupons((prev) => prev.map((n) => ({ ...n, read: true })));

    // 2. Update all unread direct notifications in Firestore via API
    try {
      await apiPost("/api/v1/auth/notifications/read-all", {});
      setDirectNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Could not update notification read-all state:", err);
    }
  };

  const markOneAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith("user-notif-")) {
      const docId = id.replace("user-notif-", "");
      try {
        await apiPost(`/api/v1/auth/notifications/${docId}/read`, {});
        setDirectNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      } catch (err) {
        console.error("Could not mark direct notification as read:", err);
      }
    } else {
      localStorage.setItem(`notif_read_${id}`, "true");
      setOrderNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setGlobalCoupons((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    setIsOpen(false);
    if (item.id.startsWith("user-notif-")) {
      const docId = item.id.replace("user-notif-", "");
      try {
        await apiPost(`/api/v1/auth/notifications/${docId}/read`, {});
        setDirectNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      } catch (err) {
        console.error("Could not mark clicked notification as read:", err);
      }
    } else {
      localStorage.setItem(`notif_read_${item.id}`, "true");
      setOrderNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      setGlobalCoupons((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    }
    navigate(item.link);
  };

  const toggleOpen = () => {
    if (!isOpen) {
      fetchNotifications(false);
    }
    setIsOpen(!isOpen);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-orange-600" />;
      case "status_shipped":
        return <Truck className="w-4 h-4 text-amber-600" />;
      case "status_delivered":
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case "coupon":
        return <Ticket className="w-4 h-4 text-purple-600" />;
      case "new_order":
        return <Truck className="w-4 h-4 text-blue-600" />;
      case "dispute":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-[var(--color-zinc-900, #0f172a)]" />;
    }
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <motion.button
        onClick={toggleOpen}
        className="w-10 h-10 rounded-full items-center justify-center bg-zinc-50 text-zinc-600 border border-zinc-200/60 hover:bg-zinc-100 hover:text-zinc-900 transition-all active:scale-95 cursor-pointer relative flex group shadow-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={t("Notifications") || "Notifications"}
      >
        <Bell className="w-5 h-5 stroke-[1.5] text-zinc-500 group-hover:text-zinc-900" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4.5 h-4.5 shrink-0"
            >
              <span className="absolute inline-flex w-full h-full rounded-full bg-orange-600 opacity-75 animate-ping" />
              <span className="relative flex bg-orange-600 text-white text-[9px] rtl:text-[11px] font-sans font-bold w-4.5 h-4.5 rounded-full items-center justify-center border border-white shadow-sm">
                {unreadCount}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="absolute end-0 mt-3 w-80 sm:w-96 bg-transparent/95 backdrop-blur-2xl border border-[var(--color-orange-600, #ea580c)] rounded-[2rem] shadow-2xl z-[100] overflow-hidden flex flex-col py-1"
          >
            <div className="px-6 py-4 border-b border-[var(--color-orange-600, #ea580c)]/50 flex items-center justify-between bg-transparent/60 shrink-0">
              <div>
                <h4 className="font-extrabold text-[var(--color-zinc-900, #0f172a)] text-sm">{t("Notifications")}</h4>
                <p className="text-[9px] rtl:text-[11px] font-sans font-bold uppercase text-[var(--color-orange-600, #ea580c)] tracking-widest rtl:tracking-normal mt-0.5">
                  {t("Mélodieux & Direct")}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[9px] rtl:text-[11px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-[var(--color-zinc-900, #0f172a)] hover:text-[var(--color-orange-600, #ea580c)] bg-white border border-[var(--color-orange-600, #ea580c)] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  {t("Tout lire (")}
                  {unreadCount})
                </button>
              )}
            </div>

            {permission === "default" && (
              <div className="px-6 py-3 bg-[var(--color-orange-600,#ea580c)]/10 border-b border-[var(--color-orange-600,#ea580c)]/20 flex items-center justify-between gap-4 shrink-0">
                <span className="text-[10px] sm:text-[11px] font-medium text-zinc-700">
                  {t("notif.enable_desk", "Activer les notifications de bureau en temps réel.")}
                </span>
                <button
                  onClick={requestPushPermission}
                  className="bg-[var(--color-orange-600,#ea580c)] text-white px-3 py-1.5 rounded-lg text-[9px] font-sans font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-[var(--color-orange-600,#ea580c)]/90"
                >
                  {t("notif.enable", "Activer")}
                </button>
              </div>
            )}

            <div className="max-h-[360px] overflow-y-auto divide-y divide-[#EBE5DF]/30">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-white/50 border border-[var(--color-orange-600, #ea580c)] rounded-full flex items-center justify-center mx-auto text-zinc-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] rtl:text-[12px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-[var(--color-zinc-900, #0f172a)]/60">
                    {t("Aucune alerte")}
                  </p>
                </div>
              ) : (
                notifications.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`flex gap-3.5 p-4 text-start transition-colors cursor-pointer select-none relative ${item.read ? "bg-transparent hover:bg-transparent/35" : "bg-[var(--color-orange-600, #ea580c)]/5 hover:bg-[var(--color-orange-600, #ea580c)]/8"}`}
                    >
                      <div className="w-9 h-9 rounded-2xl bg-white border border-[var(--color-orange-600, #ea580c)]/40 flex items-center justify-center shrink-0 shadow-xs">
                        {getIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-xs rtl:text-sm tracking-tight rtl:tracking-normal truncate leading-tight ${item.read ? "text-[var(--color-zinc-900, #0f172a)] font-bold" : "text-[var(--color-zinc-900, #0f172a)] font-extrabold"}`}
                          >
                            {item.title}
                          </p>
                          <span className="text-[8px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-400 shrink-0 mt-0.5">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-600 font-medium">{item.description}</p>
                      </div>

                      <div className="flex flex-col items-center justify-center shrink-0">
                        {!item.read ? (
                          <button
                            onClick={(e) => markOneAsRead(item.id, e)}
                            className="w-5 h-5 rounded-full hover:bg-[var(--color-orange-600, #ea580c)]/20 flex items-center justify-center transition-all bg-[var(--color-orange-600, #ea580c)]/10 shrink-0 cursor-pointer"
                            title={t("Marquer comme lu") || "Marquer comme lu"}
                          >
                            <Check className="w-3 h-3 text-[var(--color-orange-600, #ea580c)]" />
                          </button>
                        ) : (
                          <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3.5 border-t border-[var(--color-orange-600, #ea580c)]/50 bg-transparent/60 text-center shrink-0">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(
                    currentUser ? (userProfile?.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer") : "/auth"
                  );
                }}
                className="text-[9px] rtl:text-[11px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[var(--color-zinc-900, #0f172a)]/80 hover:text-[var(--color-zinc-900, #0f172a)] block w-full text-center py-2 cursor-pointer"
              >
                {t("navbar.seller_dashboard") || "Accéder au Tableau de Bord"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
