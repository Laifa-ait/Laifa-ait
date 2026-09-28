export type NotificationCategory =
  | "new_order"
  | "new_message"
  | "message"
  | "order_status"
  | "status_shipped"
  | "status_delivered"
  | "dispute"
  | "coupon"
  | "system"
  | "alert";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  createdAt: number;
  type: NotificationCategory;
  link: string;
  orderId?: string;
  read: boolean;
}

export interface RawDirectNotif {
  id: string;
  type?: string;
  createdAt?: { toDate?: () => Date; seconds?: number } | number | string | null;
  title?: string | Record<string, string>;
  message?: string | Record<string, string>;
  read?: boolean;
  orderId?: string;
  recipientId?: string;
}
