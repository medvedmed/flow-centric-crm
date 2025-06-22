
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionArea } from '@/services/permissionApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface ProtectedComponentProps {
  area: PermissionArea;
  action: 'view' | 'create' | 'edit' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hideWhenNoAccess?: boolean;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  area,
  action,
  children,
  fallback,
  hideWhenNoAccess = false
}) => {
  const { hasPermissionSync, roleLoading } = usePermissions();

  if (roleLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 rounded"></div>;
  }

  const hasAccess = hasPermissionSync(area, action);

  if (!hasAccess) {
    if (hideWhenNoAccess) {
      return null;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Lock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          You don't have permission to {action} {area.replace('_', ' ')}.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const ViewProtected: React.FC<Omit<ProtectedComponentProps, 'action'>> = (props) => (
  <ProtectedComponent {...props} action="view" />
);

export const CreateProtected: React.FC<Omit<ProtectedComponentProps, 'action'>> = (props) => (
  <ProtectedComponent {...props} action="create" />
);

export const EditProtected: React.FC<Omit<ProtectedComponentProps, 'action'>> = (props) => (
  <ProtectedComponent {...props} action="edit" />
);

export const DeleteProtected: React.FC<Omit<ProtectedComponentProps, 'action'>> = (props) => (
  <ProtectedComponent {...props} action="delete" />
);
