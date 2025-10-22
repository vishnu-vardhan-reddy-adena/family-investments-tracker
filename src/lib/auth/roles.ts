import { createClient } from '@/lib/supabase/server';

export type UserRole = 'admin' | 'user';

export interface UserWithRole {
  id: string;
  email: string | undefined;
  role: UserRole;
  full_name?: string;
  avatar_url?: string;
}

/**
 * Get the current user with their role
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role as UserRole,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  };
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUserWithRole();
  return user?.role === 'admin';
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(): Promise<UserWithRole> {
  const user = await getCurrentUserWithRole();

  if (!user) {
    throw new Error('Unauthorized: Not authenticated');
  }

  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUserWithRole();
  return user?.role === requiredRole;
}

/**
 * Get user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUserWithRole();
  return user?.role || null;
}

/**
 * Log audit event
 */
export async function logAuditEvent(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.rpc('log_audit_event', {
      p_action: action,
      p_resource_type: resourceType || null,
      p_resource_id: resourceId || null,
      p_details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging shouldn't break main functionality
  }
}
