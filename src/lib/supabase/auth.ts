import { supabase } from './client';
import type { User, Session } from '@supabase/supabase-js';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'staff';
  permissions: Record<string, boolean>;
  is_active: boolean;
}

/**
 * Sign in admin user
 */
export async function signInAdmin(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    // Fetch admin details from admins table
    if (data.user) {
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (adminError || !adminData || !adminData.is_active) {
        // Sign out if admin not found or inactive
        await supabase.auth.signOut();
        return {
          user: null,
          session: null,
          error: new Error('Admin account not found or inactive'),
        };
      }
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Sign out admin user
 */
export async function signOutAdmin(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get current admin user
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: adminData, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !adminData || !adminData.is_active) {
      return null;
    }

    return adminData as AdminUser;
  } catch (error) {
    console.error('Error getting current admin:', error);
    return null;
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRole: 'super_admin' | 'admin' | 'staff'): Promise<boolean> {
  const admin = await getCurrentAdmin();
  if (!admin) return false;

  const roleHierarchy = {
    super_admin: 3,
    admin: 2,
    staff: 1,
  };

  return roleHierarchy[admin.role] >= roleHierarchy[requiredRole];
}

/**
 * Check if user has permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const admin = await getCurrentAdmin();
  if (!admin) return false;

  // Super admin has all permissions
  if (admin.role === 'super_admin') return true;

  return admin.permissions[permission] === true;
}

/**
 * Update admin last login timestamp
 */
export async function updateAdminLastLogin(adminId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminId);

    return { error: error ? new Error(error.message) : null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

