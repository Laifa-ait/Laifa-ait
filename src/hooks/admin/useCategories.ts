import useSWR from 'swr';
import { adminApi } from '../../services/api/admin.api';

export function useCategories() {
  const { data, error, mutate, isLoading } = useSWR('/api/v1/admin/categories', adminApi.getAdminCategories);

  return {
    categories: data?.categories || [],
    isLoading,
    isError: error,
    mutate
  };
}
