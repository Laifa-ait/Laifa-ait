import React from "react";
import { Order } from "../../../../domains/order/order.types";
import { OrderRow } from "./OrderRow";
import { OrdersEmptyState } from "./OrdersEmptyState";

interface OrdersListProps {
  orders: Order[];
  currentUserId?: string;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  currentUserId,
  selectedIds,
  onToggleSelect,
  onSelectOrder,
}) => {
  if (orders.length === 0) {
    return <OrdersEmptyState />;
  }

  return (
    <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
      <div className="divide-y divide-zinc-50">
        {orders.map((o) => {
          const sellerItems = o.items?.filter((item) => item.sellerId === currentUserId) || [];
          if (sellerItems.length === 0) return null;

          return (
            <OrderRow
              key={o.id}
              order={o}
              isSelected={selectedIds.includes(o.id)}
              onToggleSelect={onToggleSelect}
              onSelectOrder={onSelectOrder}
            />
          );
        })}
      </div>
    </div>
  );
};
