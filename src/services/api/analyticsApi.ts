
import { supabase } from '@/integrations/supabase/client';

export const analyticsApi = {
  async getClientStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .select('status')
      .eq('organization_id', user.id);
    
    if (error) throw error;
    
    const stats = {
      total: data?.length || 0,
      new: data?.filter(c => c.status === 'New' || c.status === 'new').length || 0,
      regular: data?.filter(c => c.status === 'Regular' || c.status === 'regular').length || 0,
      vip: data?.filter(c => c.status === 'VIP' || c.status === 'vip').length || 0,
      active: data?.filter(c => c.status === 'Active' || c.status === 'active').length || 0,
      inactive: data?.filter(c => c.status === 'Inactive' || c.status === 'inactive').length || 0
    };

    return stats;
  },

  async getCurrentUserPermissions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user role and permissions
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, salon_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (roleError && roleError.code !== 'PGRST116') {
      throw roleError;
    }

    if (!roleData) {
      // User might be a salon owner (profile owner)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return {
        role: profileData.role || 'salon_owner',
        salonId: profileData.id,
        permissions: {} // Salon owners have all permissions
      };
    }

    // Get permissions for the role
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select('area, can_view, can_create, can_edit, can_delete')
      .eq('salon_id', roleData.salon_id)
      .eq('role', roleData.role);

    if (permError) throw permError;

    return {
      role: roleData.role,
      salonId: roleData.salon_id,
      permissions: permissions?.reduce((acc, perm) => {
        acc[perm.area] = {
          view: perm.can_view,
          create: perm.can_create,
          edit: perm.can_edit,
          delete: perm.can_delete
        };
        return acc;
      }, {} as Record<string, any>) || {}
    };
  }
};
