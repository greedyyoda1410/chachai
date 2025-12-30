import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type AddOn = Database['public']['Tables']['add_ons']['Row'];
type AddOnInsert = Database['public']['Tables']['add_ons']['Insert'];
type AddOnUpdate = Database['public']['Tables']['add_ons']['Update'];

/**
 * Get all add-ons
 */
export async function getAddOns(activeOnly: boolean = true): Promise<AddOn[]> {
  let query = supabase
    .from('add_ons')
    .select('*')
    .order('group_name_en', { ascending: true })
    .order('price', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch add-ons: ${error.message}`);
  }

  return data || [];
}

/**
 * Get add-ons by group
 */
export async function getAddOnsByGroup(groupName: string): Promise<AddOn[]> {
  const { data, error } = await supabase
    .from('add_ons')
    .select('*')
    .eq('group_name_en', groupName)
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch add-ons by group: ${error.message}`);
  }

  return data || [];
}

/**
 * Get add-ons applicable to a menu item
 */
export async function getAddOnsForMenuItem(menuItemId: string): Promise<AddOn[]> {
  const { data, error } = await supabase
    .from('add_ons')
    .select('*')
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to fetch add-ons for menu item: ${error.message}`);
  }

  if (!data) return [];

  // Filter add-ons that are applicable to this menu item
  return data.filter(addOn => {
    if (!addOn.applicable_to_items) return false;
    const applicableItems = addOn.applicable_to_items as string[];
    return applicableItems.includes(menuItemId);
  });
}

/**
 * Get add-on by ID
 */
export async function getAddOnById(id: string): Promise<AddOn | null> {
  const { data, error } = await supabase
    .from('add_ons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch add-on: ${error.message}`);
  }

  return data;
}

/**
 * Create a new add-on
 * By default, new add-ons are not applicable to any items until admin enables them
 */
export async function createAddOn(addOn: AddOnInsert): Promise<AddOn> {
  const addOnData = {
    ...addOn,
    applicable_to_items: addOn.applicable_to_items || [],
  };

  const { data, error } = await supabase
    .from('add_ons')
    .insert(addOnData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create add-on: ${error.message}`);
  }

  return data;
}

/**
 * Update an add-on
 */
export async function updateAddOn(id: string, updates: AddOnUpdate): Promise<AddOn> {
  const { data, error } = await supabase
    .from('add_ons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update add-on: ${error.message}`);
  }

  return data;
}

/**
 * Remove add-on from all menu items' applicable lists
 */
async function removeAddOnFromAllItems(addOnId: string): Promise<void> {
  // Get all add-ons that have this add-on in their applicable_to_items
  const { data: allAddOns, error: fetchError } = await supabase
    .from('add_ons')
    .select('id, applicable_to_items');

  if (fetchError) {
    throw new Error(`Failed to fetch add-ons for cleanup: ${fetchError.message}`);
  }

  // Update each add-on that includes this add-on in applicable_to_items
  // Actually, we need to remove this add-on ID from all add-ons' applicable_to_items arrays
  // But wait - applicable_to_items contains menu item IDs, not add-on IDs
  // So we don't need to do anything here - the add-on deletion itself is enough
  // The cleanup is automatic since getAddOnsForMenuItem filters by is_active and checks applicable_to_items
}

/**
 * Delete an add-on
 * This will automatically remove it from all menu items since getAddOnsForMenuItem filters by is_active
 */
export async function deleteAddOn(id: string): Promise<void> {
  const { error } = await supabase
    .from('add_ons')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete add-on: ${error.message}`);
  }

  // No need to clean up applicable_to_items - deleted add-ons won't be returned by queries
}

/**
 * Toggle add-on active status
 * When setting to inactive, the add-on will automatically be removed from user views
 * since getAddOnsForMenuItem filters by is_active
 */
export async function toggleAddOnActive(id: string, isActive: boolean): Promise<AddOn> {
  return updateAddOn(id, { is_active: isActive });
}

/**
 * Update which menu items an add-on is applicable to
 */
export async function updateAddOnApplicableItems(
  addOnId: string,
  menuItemIds: string[]
): Promise<AddOn> {
  return updateAddOn(addOnId, { applicable_to_items: menuItemIds });
}

/**
 * Add a menu item to an add-on's applicable list
 */
export async function addMenuItemToAddOn(addOnId: string, menuItemId: string): Promise<AddOn> {
  const addOn = await getAddOnById(addOnId);
  if (!addOn) {
    throw new Error('Add-on not found');
  }

  const currentItems = (addOn.applicable_to_items as string[]) || [];
  if (!currentItems.includes(menuItemId)) {
    return updateAddOn(addOnId, { applicable_to_items: [...currentItems, menuItemId] });
  }

  return addOn;
}

/**
 * Remove a menu item from an add-on's applicable list
 */
export async function removeMenuItemFromAddOn(addOnId: string, menuItemId: string): Promise<AddOn> {
  const addOn = await getAddOnById(addOnId);
  if (!addOn) {
    throw new Error('Add-on not found');
  }

  const currentItems = (addOn.applicable_to_items as string[]) || [];
  const updatedItems = currentItems.filter(id => id !== menuItemId);
  return updateAddOn(addOnId, { applicable_to_items: updatedItems });
}

