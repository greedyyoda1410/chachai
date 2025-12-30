import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert'];
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update'];

export interface MenuItemWithCategory extends MenuItem {
  category?: {
    id: string;
    name_en: string;
    name_bn: string;
  };
}

/**
 * Get all menu items
 */
export async function getMenuItems(
  categoryId?: string,
  forSaleOnly: boolean = true,
  orderType?: 'pickup' | 'delivery'
): Promise<MenuItemWithCategory[]> {
  let query = supabase
    .from('menu_items')
    .select(`
      *,
      category:categories(id, name_en, name_bn)
    `)
    .order('display_order', { ascending: true });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (forSaleOnly) {
    query = query.eq('is_for_sale', true).eq('is_available', true);
  }

  if (orderType === 'pickup') {
    query = query.eq('allow_pickup', true);
  } else if (orderType === 'delivery') {
    query = query.eq('allow_delivery', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch menu items: ${error.message}`);
  }

  return data || [];
}

/**
 * Get menu item by ID
 */
export async function getMenuItemById(id: string): Promise<MenuItemWithCategory | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      category:categories(id, name_en, name_bn)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch menu item: ${error.message}`);
  }

  return data;
}

/**
 * Create a new menu item
 */
export async function createMenuItem(item: MenuItemInsert, adminId: string): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      ...item,
      created_by: adminId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create menu item: ${error.message}`);
  }

  return data;
}

/**
 * Update a menu item
 */
export async function updateMenuItem(id: string, updates: MenuItemUpdate): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update menu item: ${error.message}`);
  }

  return data;
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete menu item: ${error.message}`);
  }
}

/**
 * Toggle menu item for sale status
 */
export async function toggleMenuItemForSale(id: string, isForSale: boolean): Promise<MenuItem> {
  return updateMenuItem(id, { is_for_sale: isForSale });
}

/**
 * Toggle menu item availability
 */
export async function toggleMenuItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
  return updateMenuItem(id, { is_available: isAvailable });
}

/**
 * Calculate total prep time for multiple items
 */
export async function calculatePrepTime(itemIds: string[]): Promise<number> {
  if (itemIds.length === 0) return 0;

  const { data, error } = await supabase
    .from('menu_items')
    .select('prep_time_minutes')
    .in('id', itemIds);

  if (error) {
    throw new Error(`Failed to calculate prep time: ${error.message}`);
  }

  if (!data || data.length === 0) return 0;

  // Return the maximum prep time (items prepared in parallel)
  return Math.max(...data.map(item => item.prep_time_minutes));
}

/**
 * Bulk update menu items
 */
export async function bulkUpdateMenuItems(
  updates: { id: string; updates: MenuItemUpdate }[]
): Promise<void> {
  const promises = updates.map(({ id, updates: itemUpdates }) =>
    updateMenuItem(id, itemUpdates)
  );

  await Promise.all(promises);
}

/**
 * Update which add-ons are available for a menu item
 * This updates all add-ons' applicable_to_items arrays
 */
export async function updateMenuItemAddOns(
  menuItemId: string,
  addOnIds: string[]
): Promise<void> {
  // Get all add-ons
  const { data: allAddOns, error: fetchError } = await supabase
    .from('add_ons')
    .select('id, applicable_to_items');

  if (fetchError) {
    throw new Error(`Failed to fetch add-ons: ${fetchError.message}`);
  }

  if (!allAddOns) return;

  // Update each add-on's applicable_to_items array
  const updatePromises = allAddOns.map(async (addOn) => {
    const currentItems = (addOn.applicable_to_items as string[]) || [];
    const shouldInclude = addOnIds.includes(addOn.id);
    const alreadyIncluded = currentItems.includes(menuItemId);

    if (shouldInclude && !alreadyIncluded) {
      // Add menu item to this add-on's applicable list
      const updatedItems = [...currentItems, menuItemId];
      await supabase
        .from('add_ons')
        .update({ applicable_to_items: updatedItems })
        .eq('id', addOn.id);
    } else if (!shouldInclude && alreadyIncluded) {
      // Remove menu item from this add-on's applicable list
      const updatedItems = currentItems.filter(id => id !== menuItemId);
      await supabase
        .from('add_ons')
        .update({ applicable_to_items: updatedItems })
        .eq('id', addOn.id);
    }
  });

  await Promise.all(updatePromises);
}

