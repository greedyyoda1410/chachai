import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type ContentAsset = Database['public']['Tables']['content_assets']['Row'];
type ContentAssetInsert = Database['public']['Tables']['content_assets']['Insert'];
type ContentAssetUpdate = Database['public']['Tables']['content_assets']['Update'];

/**
 * Get all content assets
 */
export async function getContentAssets(assetType?: string, activeOnly: boolean = true): Promise<ContentAsset[]> {
  let query = supabase
    .from('content_assets')
    .select('*')
    .order('display_order', { ascending: true });

  if (assetType) {
    query = query.eq('asset_type', assetType);
  }

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch content assets: ${error.message}`);
  }

  return data || [];
}

/**
 * Get content asset by ID
 */
export async function getContentAssetById(id: string): Promise<ContentAsset | null> {
  const { data, error } = await supabase
    .from('content_assets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch content asset: ${error.message}`);
  }

  return data;
}

/**
 * Get content asset by type
 */
export async function getContentAssetByType(assetType: string): Promise<ContentAsset | null> {
  const { data, error } = await supabase
    .from('content_assets')
    .select('*')
    .eq('asset_type', assetType)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch content asset: ${error.message}`);
  }

  return data;
}

/**
 * Create a content asset
 */
export async function createContentAsset(asset: ContentAssetInsert, adminId: string): Promise<ContentAsset> {
  const { data, error } = await supabase
    .from('content_assets')
    .insert({
      ...asset,
      created_by: adminId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create content asset: ${error.message}`);
  }

  return data;
}

/**
 * Update a content asset
 */
export async function updateContentAsset(id: string, updates: ContentAssetUpdate): Promise<ContentAsset> {
  const { data, error } = await supabase
    .from('content_assets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update content asset: ${error.message}`);
  }

  return data;
}

/**
 * Delete a content asset
 */
export async function deleteContentAsset(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_assets')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete content asset: ${error.message}`);
  }
}

