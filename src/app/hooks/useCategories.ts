import { useQuery } from '@tanstack/react-query';
import { getCategories, getCategoryById } from '../../lib/services/categories';

export function useCategories(activeOnly: boolean = true) {
  return useQuery({
    queryKey: ['categories', activeOnly],
    queryFn: () => getCategories(activeOnly),
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => (id ? getCategoryById(id) : null),
    enabled: !!id,
  });
}

