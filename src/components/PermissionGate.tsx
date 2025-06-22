
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionArea } from '@/services/permissionApi';

interface PermissionGateProps {
  area: PermissionArea;
  action: 'view' | 'create' | 'edit' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: string[]; // Optional: restrict to specific roles
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  area,
  action,
  children,
  fallback = null,
  roles
}) => {
  const { hasPermissionSync, userRole, roleLoading } = usePermissions();

  if (roleLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8 w-32" />;
  }

  // Check role restriction first if specified
  if (roles && userRole && !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // Check permission
  const hasPermission = hasPermissionSync(area, action);
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
