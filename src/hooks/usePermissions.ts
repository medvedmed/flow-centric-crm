
import { useQuery } from '@tanstack/react-query';
import { permissionApi, PermissionArea } from '@/services/permissionApi';
import { analyticsApi } from '@/services/api/analyticsApi';

export const usePermissions = () => {
  const { data: permissionsData, isLoading: roleLoading, error } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      try {
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
  });

  const hasPermissionSync = (area: PermissionArea, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!permissionsData) return false;
    
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
    salonId: permissionsData?.salonId
  };
};

export const useRoleManagement = () => {
  const { data: rolePermissions, isLoading: permissionsLoading, error, refetch: refetchPermissions } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: () => permissionApi.getRolePermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    rolePermissions,
    permissionsLoading,
    error,
    refetchPermissions
  };
};
