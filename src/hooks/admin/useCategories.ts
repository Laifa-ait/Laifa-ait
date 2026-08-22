import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api/admin.api';

export function useCategories() {
  const queryClient = useQueryClient();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: adminApi.getAdminCategories,
  });

  const mutate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
  };

  return {
    categories: data?.categories || [],
    isLoading,
    isError: error,
    mutate,
    refetch,
  };
}
