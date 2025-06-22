
import { useQuery } from '@tanstack/react-query';
import { permissionApi, PermissionArea } from '@/services/permissionApi';

export const usePermissions = () => {
  const { data: permissionsData, isLoading: roleLoading, error } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => permissionApi.getCurrentUserPermissions(),
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
