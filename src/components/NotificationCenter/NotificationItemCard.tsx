import React from 'react';
import { 
  Package, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  Ticket, 
  AlertCircle, 
  Bell, 
  Check 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotificationItem } from './notification.types';

interface NotificationItemCardProps {
  item: NotificationItem;
  onClick: (item: NotificationItem) => void;
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
}

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  item,
  onClick,
  onMarkAsRead,
}) => {
  const { t } = useTranslation();

  const getBadgeStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'new_order':
        return {
          icon: Package,
          iconColor: 'text-emerald-700',
          bg: 'bg-emerald-50 border-emerald-200/60',
        };
      case 'new_message':
      case 'message':
        return {
          icon: MessageSquare,
          iconColor: 'text-orange-600',
          bg: 'bg-orange-50 border-orange-200/60',
        };
      case 'status_shipped':
      case 'order_status':
        return {
          icon: Truck,
          iconColor: 'text-sky-700',
          bg: 'bg-sky-50 border-sky-200/60',
        };
      case 'status_delivered':
        return {
          icon: ShieldCheck,
          iconColor: 'text-emerald-700',
          bg: 'bg-emerald-50 border-emerald-200/60',
        };
      case 'coupon':
        return {
          icon: Ticket,
          iconColor: 'text-purple-700',
          bg: 'bg-purple-50 border-purple-200/60',
        };
      case 'dispute':
      case 'alert':
        return {
          icon: AlertCircle,
          iconColor: 'text-rose-700',
          bg: 'bg-rose-50 border-rose-200/60',
        };
      default:
        return {
          icon: Bell,
          iconColor: 'text-stone-700',
          bg: 'bg-stone-100 border-stone-200/60',
        };
    }
  };

  const style = getBadgeStyle(item.type);
  const Icon = style.icon;

  return (
    <div
      onClick={() => onClick(item)}
      className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer select-none text-left border-b border-stone-100 last:border-b-0 ${
        item.read
          ? 'bg-white hover:bg-stone-50/80 text-stone-600'
          : 'bg-orange-50/30 hover:bg-orange-50/50 text-stone-900'
      }`}
    >
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${style.bg} ${style.iconColor}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={`text-xs leading-snug line-clamp-1 ${
              item.read ? 'font-semibold text-stone-800' : 'font-bold text-stone-950'
            }`}
          >
            {item.title}
          </p>
          <span className="text-[10px] text-stone-400 font-medium shrink-0">
            {item.time}
          </span>
        </div>

        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed font-normal">
          {item.description}
        </p>
      </div>

      {/* Unread Action */}
      <div className="flex items-center shrink-0 self-center pl-1">
        {!item.read ? (
          <button
            type="button"
            onClick={(e) => onMarkAsRead(item.id, e)}
            className="p-1 rounded-full text-orange-600 hover:bg-orange-100 transition-colors cursor-pointer"
            title={t("Marquer comme lu") || "Marquer comme lu"}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-stone-200" />
        )}
      </div>
    </div>
  );
};
