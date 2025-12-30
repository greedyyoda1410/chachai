import { useQuery } from '@tanstack/react-query';
import { getAddOns, getAddOnsByGroup, getAddOnsForMenuItem } from '../../lib/services/addOns';

export function useAddOns(activeOnly: boolean = true) {
  return useQuery({
    queryKey: ['addOns', activeOnly],
    queryFn: () => getAddOns(activeOnly),
  });
}

export function useAddOnsByGroup(groupName: string | undefined) {
  return useQuery({
    queryKey: ['addOns', 'group', groupName],
    queryFn: () => (groupName ? getAddOnsByGroup(groupName) : []),
    enabled: !!groupName,
  });
}

export function useAddOnsForMenuItem(menuItemId: string | undefined) {
  return useQuery({
    queryKey: ['addOns', 'menuItem', menuItemId],
    queryFn: () => (menuItemId ? getAddOnsForMenuItem(menuItemId) : []),
    enabled: !!menuItemId,
  });
}

