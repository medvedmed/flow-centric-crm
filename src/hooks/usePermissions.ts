
import { useQuery } from '@tanstack/react-query';
import { permissionApi, PermissionArea } from '@/services/permissionApi';
import { analyticsApi } from '@/services/api/analyticsApi';
import { useStaffAuth } from '@/hooks/useStaffAuth';

export const usePermissions = () => {
  const { staffData, isStaff } = useStaffAuth();

  const { data: permissionsData, isLoading: roleLoading, error } = useQuery({
    queryKey: ['user-permissions', isStaff, staffData?.id],
    queryFn: async () => {
      try {
        // If user is staff, return staff role data
        if (isStaff && staffData) {
          return {
            role: 'staff' as const,
            salonId: staffData.salon_id,
            permissions: {}
          };
        }
        
        // Otherwise get regular user permissions
        return await analyticsApi.getCurrentUserPermissions();
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Return default structure if error occurs
        return {
          role: 'salon_owner' as const,
          salonId: null,
          permissions: {}
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const hasPermissionSync = (area: PermissionArea, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!permissionsData) return false;
    
    // Staff have limited VIEW-ONLY permissions
    if (permissionsData.role === 'staff') {
      const staffPermissions = {
        'dashboard': { view: false, create: false, edit: false, delete: false },
        'appointments': { view: true, create: false, edit: false, delete: false },
        'clients': { view: true, create: false, edit: false, delete: false },
        'services': { view: false, create: false, edit: false, delete: false },
        'staff_management': { view: false, create: false, edit: false, delete: false },
        'inventory': { view: false, create: false, edit: false, delete: false },
        'reports': { view: false, create: false, edit: false, delete: false },
        'settings': { view: false, create: false, edit: false, delete: false },
        'schedule_management': { view: false, create: false, edit: false, delete: false },
        'time_off_requests': { view: false, create: false, edit: false, delete: false },
        'payments': { view: false, create: false, edit: false, delete: false }
      };
      
      const areaPermissions = staffPermissions[area as keyof typeof staffPermissions];
      return areaPermissions ? areaPermissions[action] : false;
    }

    // Receptionist permissions
    if (permissionsData.role === 'receptionist') {
      const receptionistPermissions = {
        'dashboard': { view: true, create: false, edit: false, delete: false },
        'appointments': { view: true, create: true, edit: true, delete: false },
        'clients': { view: true, create: true, edit: true, delete: false },
        'services': { view: true, create: false, edit: false, delete: false },
        'staff_management': { view: true, create: false, edit: false, delete: false },
        'inventory': { view: false, create: false, edit: false, delete: false },
        'reports': { view: false, create: false, edit: false, delete: false },
        'settings': { view: false, create: false, edit: false, delete: false },
        'schedule_management': { view: true, create: false, edit: false, delete: false },
        'time_off_requests': { view: false, create: false, edit: false, delete: false },
        'payments': { view: true, create: true, edit: false, delete: false }
      };
      
      const areaPermissions = receptionistPermissions[area as keyof typeof receptionistPermissions];
      return areaPermissions ? areaPermissions[action] : false;
    }
    
    // Salon owners have all permissions
    if (permissionsData.role === 'salon_owner') return true;
    
    const areaPermissions = permissionsData.permissions[area];
    if (!areaPermissions) return false;
    
    return areaPermissions[action] || false;
  };

  const hasPermission = async (area: PermissionArea, action: 'view' | 'create' | 'edit' | 'delete'): Promise<boolean> => {
    try {
      return await permissionApi.hasPermission(area, action);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  return {
    permissionsData,
    roleLoading,
    error,
    hasPermissionSync,
    hasPermission,
    userRole: permissionsData?.role,
    salonId: permissionsData?.salonId,
    isLoading: roleLoading
  };
};

export const useRoleManagement = () => {
  const { data: rolePermissions, isLoading: permissionsLoading, error, refetch: refetchPermissions } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: () => permissionApi.getRolePermissions(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    rolePermissions,
    permissionsLoading,
    error,
    refetchPermissions,
    isLoading: permissionsLoading
  };
};
