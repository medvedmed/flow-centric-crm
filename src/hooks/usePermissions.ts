
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { permissionApi, AppRole, PermissionArea, UserRole } from '@/services/permissionApi';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();
  
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: () => permissionApi.getCurrentUserRole(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const checkPermission = async (area: PermissionArea, action: 'view' | 'create' | 'edit' | 'delete'): Promise<boolean> => {
    if (!user || !userRole) return false;
    
    // Salon owners have all permissions
    if (userRole.role === 'salon_owner') return true;
    
    return await permissionApi.hasPermission(area, action);
  };

  const hasPermissionSync = (area: PermissionArea, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!user || !userRole) return false;
    
    // Salon owners have all permissions
    if (userRole.role === 'salon_owner') return true;
    
    // For sync checks, we'll implement a simple role-based fallback
    // This should be enhanced with cached permission data in a real app
    const rolePermissions: Record<AppRole, Record<PermissionArea, string[]>> = {
      salon_owner: {
        dashboard: ['view', 'create', 'edit', 'delete'],
        appointments: ['view', 'create', 'edit', 'delete'],
        clients: ['view', 'create', 'edit', 'delete'],
        staff_management: ['view', 'create', 'edit', 'delete'],
        services: ['view', 'create', 'edit', 'delete'],
        inventory: ['view', 'create', 'edit', 'delete'],
        reports: ['view', 'create', 'edit', 'delete'],
        settings: ['view', 'create', 'edit', 'delete'],
        schedule_management: ['view', 'create', 'edit', 'delete'],
        time_off_requests: ['view', 'create', 'edit', 'delete']
      },
      manager: {
        dashboard: ['view', 'create', 'edit', 'delete'],
        appointments: ['view', 'create', 'edit', 'delete'],
        clients: ['view', 'create', 'edit', 'delete'],
        staff_management: ['view', 'create', 'edit'],
        services: ['view', 'create', 'edit', 'delete'],
        inventory: ['view', 'create', 'edit', 'delete'],
        reports: ['view', 'create', 'edit', 'delete'],
        settings: ['view'],
        schedule_management: ['view', 'create', 'edit', 'delete'],
        time_off_requests: ['view', 'create', 'edit', 'delete']
      },
      staff: {
        dashboard: ['view'],
        appointments: ['view', 'edit'],
        clients: ['view', 'edit'],
        staff_management: [],
        services: ['view'],
        inventory: [],
        reports: [],
        settings: [],
        schedule_management: ['view'],
        time_off_requests: ['view', 'create']
      },
      receptionist: {
        dashboard: ['view'],
        appointments: ['view', 'create', 'edit'],
        clients: ['view', 'create', 'edit'],
        staff_management: [],
        services: ['view'],
        inventory: [],
        reports: ['view'],
        settings: [],
        schedule_management: ['view', 'create', 'edit'],
        time_off_requests: ['view']
      }
    };

    const allowedActions = rolePermissions[userRole.role]?.[area] || [];
    return allowedActions.includes(action);
  };

  return {
    userRole,
    roleLoading,
    checkPermission,
    hasPermissionSync,
    isAdmin: userRole?.role === 'salon_owner',
    isManager: userRole?.role === 'manager',
    isStaff: userRole?.role === 'staff',
    isReceptionist: userRole?.role === 'receptionist'
  };
};

export const useRoleManagement = () => {
  const { data: salonUsers, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['salonUsers'],
    queryFn: () => permissionApi.getSalonUsers(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: rolePermissions, isLoading: permissionsLoading, refetch: refetchPermissions } = useQuery({
    queryKey: ['rolePermissions'],
    queryFn: () => permissionApi.getRolePermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    salonUsers,
    rolePermissions,
    usersLoading,
    permissionsLoading,
    refetchUsers,
    refetchPermissions
  };
};
