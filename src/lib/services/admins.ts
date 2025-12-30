import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import type { AdminUser } from '../supabase/auth';

type Admin = Database['public']['Tables']['admins']['Row'];
type AdminInsert = Database['public']['Tables']['admins']['Insert'];
type AdminUpdate = Database['public']['Tables']['admins']['Update'];

/**
 * Get all admins
 */
export async function getAdmins(activeOnly: boolean = false): Promise<Admin[]> {
  let query = supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch admins: ${error.message}`);
  }

  return data || [];
}

/**
 * Get admin by ID
 */
export async function getAdminById(id: string): Promise<Admin | null> {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch admin: ${error.message}`);
  }

  return data;
}

/**
 * Create a new admin
 */
export async function createAdmin(admin: AdminInsert): Promise<Admin> {
  const { data, error } = await supabase
    .from('admins')
    .insert(admin)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create admin: ${error.message}`);
  }

  return data;
}

/**
 * Update an admin
 */
export async function updateAdmin(id: string, updates: AdminUpdate): Promise<Admin> {
  const { data, error } = await supabase
    .from('admins')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update admin: ${error.message}`);
  }

  return data;
}

/**
 * Delete an admin
 */
export async function deleteAdmin(id: string): Promise<void> {
  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete admin: ${error.message}`);
  }
}

/**
 * Update admin last login
 */
export async function updateAdminLastLogin(id: string): Promise<void> {
  await supabase
    .from('admins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', id);
}

/**
 * Check if admin has required role
 */
export function hasRequiredRole(admin: AdminUser | null, requiredRole: 'super_admin' | 'admin' | 'staff'): boolean {
  if (!admin) return false;

  const roleHierarchy = {
    super_admin: 3,
    admin: 2,
    staff: 1,
  };

  return roleHierarchy[admin.role] >= roleHierarchy[requiredRole];
}

/**
 * Check if admin has permission
 */
export function hasPermission(admin: AdminUser | null, permission: string): boolean {
  if (!admin) return false;

  // Super admin has all permissions
  if (admin.role === 'super_admin') return true;

  return admin.permissions[permission] === true;
}

