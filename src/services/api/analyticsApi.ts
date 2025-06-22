
import { supabase } from '@/integrations/supabase/client';

export const analyticsApi = {
  async getClientStats(): Promise<{
    totalClients: number;
    newClients: number;
    activeClients: number;
    vipClients: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .select('status')
      .eq('salon_id', user.id);
    
    if (error) throw error;

    const stats = {
      totalClients: data?.length || 0,
      newClients: data?.filter(c => c.status === 'New').length || 0,
      activeClients: data?.filter(c => c.status === 'Active').length || 0,
      vipClients: data?.filter(c => c.status === 'VIP').length || 0,
    };

    return stats;
  },

  async getCurrentUserPermissions(): Promise<Record<string, boolean>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    try {
      // Get user role first
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role, salon_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userRole) {
        // If no role found, assume salon owner (for backward compatibility)
        return {
          'dashboard.view': true,
          'appointments.view': true,
          'appointments.create': true,
          'appointments.edit': true,
          'appointments.delete': true,
          'clients.view': true,
          'clients.create': true,
          'clients.edit': true,
          'clients.delete': true,
          'staff_management.view': true,
          'staff_management.create': true,
          'staff_management.edit': true,
          'staff_management.delete': true,
          'services.view': true,
          'services.create': true,
          'services.edit': true,
          'services.delete': true,
          'inventory.view': true,
          'inventory.create': true,
          'inventory.edit': true,
          'inventory.delete': true,
          'reports.view': true,
          'reports.create': true,
          'reports.edit': true,
          'reports.delete': true,
          'settings.view': true,
          'settings.create': true,
          'settings.edit': true,
          'settings.delete': true,
          'schedule_management.view': true,
          'schedule_management.create': true,
          'schedule_management.edit': true,
          'schedule_management.delete': true,
          'time_off_requests.view': true,
          'time_off_requests.create': true,
          'time_off_requests.edit': true,
          'time_off_requests.delete': true
        };
      }

      // Salon owners have all permissions
      if (userRole.role === 'salon_owner') {
        return {
          'dashboard.view': true,
          'appointments.view': true,
          'appointments.create': true,
          'appointments.edit': true,
          'appointments.delete': true,
          'clients.view': true,
          'clients.create': true,
          'clients.edit': true,
          'clients.delete': true,
          'staff_management.view': true,
          'staff_management.create': true,
          'staff_management.edit': true,
          'staff_management.delete': true,
          'services.view': true,
          'services.create': true,
          'services.edit': true,
          'services.delete': true,
          'inventory.view': true,
          'inventory.create': true,
          'inventory.edit': true,
          'inventory.delete': true,
          'reports.view': true,
          'reports.create': true,
          'reports.edit': true,
          'reports.delete': true,
          'settings.view': true,
          'settings.create': true,
          'settings.edit': true,
          'settings.delete': true,
          'schedule_management.view': true,
          'schedule_management.create': true,
          'schedule_management.edit': true,
          'schedule_management.delete': true,
          'time_off_requests.view': true,
          'time_off_requests.create': true,
          'time_off_requests.edit': true,
          'time_off_requests.delete': true
        };
      }

      // Get role-specific permissions
      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('area, can_view, can_create, can_edit, can_delete')
        .eq('salon_id', userRole.salon_id)
        .eq('role', userRole.role);

      const permissionMap: Record<string, boolean> = {};
      
      permissions?.forEach(perm => {
        permissionMap[`${perm.area}.view`] = perm.can_view;
        permissionMap[`${perm.area}.create`] = perm.can_create;
        permissionMap[`${perm.area}.edit`] = perm.can_edit;
        permissionMap[`${perm.area}.delete`] = perm.can_delete;
      });

      return permissionMap;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return {};
    }
  }
};
