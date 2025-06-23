
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionArea } from '@/services/permissionApi';

export const useRoleBasedUI = () => {
  const { userRole, hasPermissionSync, isLoading } = usePermissions();

  const canAccess = (area: PermissionArea, action: 'view' | 'create' | 'edit' | 'delete') => {
    return hasPermissionSync(area, action);
  };

  const isRole = (role: string | string[]) => {
    if (!userRole) return false;
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  };

  const getAccessibleFeatures = () => {
    const features = {
      canManageStaff: canAccess('staff_management', 'view'),
      canManageSettings: canAccess('settings', 'edit'),
      canViewReports: canAccess('reports', 'view'),
      canManageInventory: canAccess('inventory', 'view'),
      canManageServices: canAccess('services', 'edit'),
      canBookAppointments: canAccess('appointments', 'create'),
      canViewClients: canAccess('clients', 'view'),
      canManageSchedules: canAccess('schedule_management', 'edit'),
    };

    return features;
  };

  const getRoleDisplayInfo = () => {
    const roleInfo = {
      salon_owner: {
        displayName: 'Salon Owner',
        color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
        description: 'Full access to all features'
      },
      manager: {
        displayName: 'Manager',
        color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
        description: 'Manages staff and operations'
      },
      staff: {
        displayName: 'Staff',
        color: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
        description: 'Provides services to clients'
      },
      receptionist: {
        displayName: 'Receptionist',
        color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
        description: 'Manages front desk operations'
      }
    };

    return userRole ? roleInfo[userRole as keyof typeof roleInfo] : null;
  };

  return {
    userRole,
    isLoading,
    canAccess,
    isRole,
    getAccessibleFeatures,
    getRoleDisplayInfo,
    // Convenience methods for common role checks
    isOwner: isRole('salon_owner'),
    isManager: isRole('manager'),
    isStaff: isRole('staff'),
    isReceptionist: isRole('receptionist'),
    isAdminRole: isRole(['salon_owner', 'manager'])
  };
};
