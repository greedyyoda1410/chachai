import { useQuery } from '@tanstack/react-query';
import { getPromotions, getPromotionById } from '../../lib/services/promotions';

export function usePromotions(forSaleOnly: boolean = true) {
  return useQuery({
    queryKey: ['promotions', forSaleOnly],
    queryFn: () => getPromotions(forSaleOnly),
  });
}

export function usePromotion(id: string | undefined) {
  return useQuery({
    queryKey: ['promotion', id],
    queryFn: () => (id ? getPromotionById(id) : null),
    enabled: !!id,
  });
}

