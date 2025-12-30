import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type Promotion = Database['public']['Tables']['promotions']['Row'];
type PromotionInsert = Database['public']['Tables']['promotions']['Insert'];
type PromotionUpdate = Database['public']['Tables']['promotions']['Update'];
type PromotionItem = Database['public']['Tables']['promotion_items']['Row'];

export interface PromotionWithItems extends Promotion {
  items: (PromotionItem & {
    menu_item: {
      id: string;
      name_en: string;
      name_bn: string;
      takeaway_price: number;
    };
  })[];
  savings?: {
    savings_amount: number;
    savings_percentage: number;
    individual_total: number;
    promotional_price: number;
  };
}

/**
 * Get all promotions
 */
export async function getPromotions(forSaleOnly: boolean = true): Promise<PromotionWithItems[]> {
  let query = supabase
    .from('promotions')
    .select(`
      *,
      items:promotion_items(
        *,
        menu_item:menu_items(id, name_en, name_bn, takeaway_price)
      )
    `)
    .order('created_at', { ascending: false });

  if (forSaleOnly) {
    query = query.eq('is_for_sale', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch promotions: ${error.message}`);
  }

  if (!data) return [];

  // Calculate savings for each promotion
  const promotionsWithSavings = await Promise.all(
    data.map(async (promo) => {
      const savings = await calculatePromotionSavings(promo.id);
      return { ...promo, savings };
    })
  );

  return promotionsWithSavings as PromotionWithItems[];
}

/**
 * Get promotion by ID
 */
export async function getPromotionById(id: string): Promise<PromotionWithItems | null> {
  const { data, error } = await supabase
    .from('promotions')
    .select(`
      *,
      items:promotion_items(
        *,
        menu_item:menu_items(id, name_en, name_bn, takeaway_price)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch promotion: ${error.message}`);
  }

  if (!data) return null;

  const savings = await calculatePromotionSavings(id);
  return { ...data, savings } as PromotionWithItems;
}

/**
 * Create a new promotion
 */
export async function createPromotion(
  promotion: PromotionInsert,
  itemIds: string[],
  quantities: number[],
  adminId: string
): Promise<PromotionWithItems> {
  // Create promotion
  const { data: promo, error: promoError } = await supabase
    .from('promotions')
    .insert({
      ...promotion,
      created_by: adminId,
    })
    .select()
    .single();

  if (promoError) {
    throw new Error(`Failed to create promotion: ${promoError.message}`);
  }

  // Create promotion items
  if (itemIds.length > 0) {
    const promotionItems = itemIds.map((itemId, index) => ({
      promotion_id: promo.id,
      menu_item_id: itemId,
      quantity: quantities[index] || 1,
    }));

    const { error: itemsError } = await supabase
      .from('promotion_items')
      .insert(promotionItems);

    if (itemsError) {
      // Rollback promotion if items fail
      await supabase.from('promotions').delete().eq('id', promo.id);
      throw new Error(`Failed to create promotion items: ${itemsError.message}`);
    }
  }

  return getPromotionById(promo.id) as Promise<PromotionWithItems>;
}

/**
 * Update a promotion
 */
export async function updatePromotion(
  id: string,
  updates: PromotionUpdate,
  itemIds?: string[],
  quantities?: number[]
): Promise<PromotionWithItems> {
  // Update promotion
  const { error: updateError } = await supabase
    .from('promotions')
    .update(updates)
    .eq('id', id);

  if (updateError) {
    throw new Error(`Failed to update promotion: ${updateError.message}`);
  }

  // Update promotion items if provided
  if (itemIds && quantities) {
    // Delete existing items
    await supabase.from('promotion_items').delete().eq('promotion_id', id);

    // Insert new items
    if (itemIds.length > 0) {
      const promotionItems = itemIds.map((itemId, index) => ({
        promotion_id: id,
        menu_item_id: itemId,
        quantity: quantities[index] || 1,
      }));

      const { error: itemsError } = await supabase
        .from('promotion_items')
        .insert(promotionItems);

      if (itemsError) {
        throw new Error(`Failed to update promotion items: ${itemsError.message}`);
      }
    }
  }

  return getPromotionById(id) as Promise<PromotionWithItems>;
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id: string): Promise<void> {
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete promotion: ${error.message}`);
  }
}

/**
 * Toggle promotion for sale status
 */
export async function togglePromotionForSale(id: string, isForSale: boolean): Promise<Promotion> {
  const { data, error } = await supabase
    .from('promotions')
    .update({ is_for_sale: isForSale })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to toggle promotion for sale: ${error.message}`);
  }

  return data;
}

/**
 * Calculate promotion savings
 */
export async function calculatePromotionSavings(promotionId: string): Promise<{
  savings_amount: number;
  savings_percentage: number;
  individual_total: number;
  promotional_price: number;
}> {
  const { data, error } = await supabase.rpc('calculate_promotion_savings', {
    promo_id: promotionId,
  });

  if (error) {
    throw new Error(`Failed to calculate promotion savings: ${error.message}`);
  }

  return data || {
    savings_amount: 0,
    savings_percentage: 0,
    individual_total: 0,
    promotional_price: 0,
  };
}

