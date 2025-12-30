import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export interface CategoryWithItems extends Category {
  item_count?: number;
}

/**
 * Get all categories
 */
export async function getCategories(activeOnly: boolean = false): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data || [];
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch category: ${error.message}`);
  }

  return data;
}

/**
 * Create a new category
 */
export async function createCategory(category: CategoryInsert, adminId: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      created_by: adminId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data;
}

/**
 * Update a category
 */
export async function updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return data;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}

/**
 * Toggle category active status
 */
export async function toggleCategoryActive(id: string, isActive: boolean): Promise<Category> {
  return updateCategory(id, { is_active: isActive });
}

/**
 * Update category display order
 */
export async function updateCategoryOrder(categoryOrders: { id: string; display_order: number }[]): Promise<void> {
  const updates = categoryOrders.map(({ id, display_order }) =>
    supabase
      .from('categories')
      .update({ display_order })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    throw new Error(`Failed to update category order: ${errors[0].error?.message}`);
  }
}

