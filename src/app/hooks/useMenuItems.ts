import { useQuery } from '@tanstack/react-query';
import { getMenuItems, getMenuItemById } from '../../lib/services/menuItems';

export function useMenuItems(
  categoryId?: string,
  forSaleOnly: boolean = true,
  orderType?: 'pickup' | 'delivery'
) {
  return useQuery({
    queryKey: ['menuItems', categoryId, forSaleOnly, orderType],
    queryFn: () => getMenuItems(categoryId, forSaleOnly, orderType),
  });
}

export function useMenuItem(id: string | undefined) {
  return useQuery({
    queryKey: ['menuItem', id],
    queryFn: () => (id ? getMenuItemById(id) : null),
    enabled: !!id,
  });
}

