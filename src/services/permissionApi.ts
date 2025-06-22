
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'salon_owner' | 'manager' | 'staff' | 'receptionist';
export type PermissionArea = 
  | 'dashboard' 
  | 'appointments' 
  | 'clients' 
  | 'staff_management' 
  | 'services' 
  | 'inventory' 
  | 'reports' 
  | 'settings'
  | 'schedule_management'
  | 'time_off_requests';

export interface UserRole {
  id: string;
  userId: string;
  salonId: string;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: string;
  salonId: string;
  role: AppRole;
  area: PermissionArea;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export const permissionApi = {
  // Get current user's role and permissions
  async getCurrentUserRole(): Promise<UserRole | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      salonId: data.salon_id,
      role: data.role as AppRole,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Check if user has permission for specific area and action
  async hasPermission(area: PermissionArea, action: 'view' | 'create' | 'edit' | 'delete'): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const userRole = await this.getCurrentUserRole();
    if (!userRole) return false;

    const { data, error } = await supabase.rpc('has_permission', {
      user_id: user.id,
      salon_id: userRole.salonId,
      area: area,
      action: action
    });

    if (error) {
      console.error('Permission check error:', error);
      return false;
    }

    return data || false;
  },

  // Get all users with roles for current salon
  async getSalonUsers(): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(role => ({
      id: role.id,
      userId: role.user_id,
      salonId: role.salon_id,
      role: role.role as AppRole,
      isActive: role.is_active,
      createdAt: role.created_at,
      updatedAt: role.updated_at
    })) || [];
  },

  // Get role permissions for current salon
  async getRolePermissions(): Promise<RolePermission[]> {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .order('role', { ascending: true })
      .order('area', { ascending: true });

    if (error) throw error;

    return data?.map(perm => ({
      id: perm.id,
      salonId: perm.salon_id,
      role: perm.role as AppRole,
      area: perm.area as PermissionArea,
      canView: perm.can_view,
      canCreate: perm.can_create,
      canEdit: perm.can_edit,
      canDelete: perm.can_delete,
      createdAt: perm.created_at,
      updatedAt: perm.updated_at
    })) || [];
  },

  // Update role permissions
  async updateRolePermission(
    role: AppRole, 
    area: PermissionArea, 
    permissions: Partial<Pick<RolePermission, 'canView' | 'canCreate' | 'canEdit' | 'canDelete'>>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('role_permissions')
      .update({
        can_view: permissions.canView,
        can_create: permissions.canCreate,
        can_edit: permissions.canEdit,
        can_delete: permissions.canDelete,
        updated_at: new Date().toISOString()
      })
      .eq('salon_id', user.id)
      .eq('role', role)
      .eq('area', area);

    if (error) throw error;
  },

  // Assign role to user
  async assignUserRole(userId: string, role: AppRole): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        salon_id: user.id,
        role: role,
        is_active: true,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }
};
