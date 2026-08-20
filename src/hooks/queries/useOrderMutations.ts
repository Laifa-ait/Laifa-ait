import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, CreateOrderInput, UpdateOrderStatusInput } from '../../services/api/orders.api';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Mutation hook for creating an order.
 * Invalidates order queries and product queries (since stock changes upon order).
 */
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};

/**
 * Mutation hook for updating order status.
 * Invalidates order queries.
 */
export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOrderStatusInput) => ordersApi.updateOrderStatus(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      if (variables.orderId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) });
      }
    },
  });
};
