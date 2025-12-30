import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrderById, createOrder, updateOrderStatus, type CreateOrderData } from '../../lib/services/orders';

export function useOrders(filters?: {
  status?: string;
  orderType?: 'pickup' | 'delivery';
  startDate?: Date;
  endDate?: Date;
  customerPhone?: string;
  limit?: number;
}) {
  // Serialize dates in query key to prevent unnecessary refetches
  const serializedFilters = filters ? {
    ...filters,
    startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : undefined,
    endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : undefined,
  } : undefined;

  return useQuery({
    queryKey: ['orders', serializedFilters],
    queryFn: () => getOrders(filters || {}),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 2, // Retry failed requests 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => (id ? getOrderById(id) : null),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderData) => createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status, adminId, notes }: { orderId: string; status: string; adminId?: string; notes?: string }) =>
      updateOrderStatus(orderId, status as any, adminId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

