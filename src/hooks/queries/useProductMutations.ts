import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, CreateProductInput, UpdateProductInput } from '../../services/api/products.api';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Mutation hook for creating a product.
 * Invalidates all product queries upon success.
 */
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
    },
  });
};

/**
 * Mutation hook for updating a product.
 * Invalidates all product queries and specific product detail cache upon success.
 */
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProductInput) => productsApi.updateProduct(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
    },
  });
};

/**
 * Mutation hook for deleting a product.
 * Invalidates all product queries upon success.
 */
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productsApi.deleteProduct(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
    },
  });
};
