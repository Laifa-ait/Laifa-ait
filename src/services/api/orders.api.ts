import { apiGet, apiPost, apiPut } from '../../lib/api';
import { Order, OrderStatus } from '../../domains/order/order.types';

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    variantName?: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    wilaya: string;
    commune: string;
    street: string;
  };
  paymentMethod: string;
  totalAmount: number;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  note?: string;
}

export const ordersApi = {
  getOrderById: async (orderId: string): Promise<Order> => {
    return apiGet<Order>(`/api/v1/orders/${encodeURIComponent(orderId)}`);
  },

  createOrder: async (input: CreateOrderInput): Promise<{ orderId: string; success: boolean }> => {
    return apiPost<{ orderId: string; success: boolean }>('/api/v1/orders', input);
  },

  updateOrderStatus: async (input: UpdateOrderStatusInput): Promise<{ success: boolean }> => {
    return apiPut<{ success: boolean }>(`/api/v1/orders/${encodeURIComponent(input.orderId)}/status`, {
      status: input.status,
      note: input.note,
    });
  },
};
