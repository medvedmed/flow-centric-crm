
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface RoleBasedContentProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  allowedRoles,
  children,
  fallback,
  showFallback = true
}) => {
  const { userRole, roleLoading } = usePermissions();

  if (roleLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-32 w-full" />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    if (showFallback) {
      return fallback || (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-sm text-orange-700">
              This content is restricted to: {allowedRoles.join(', ')}
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  return <>{children}</>;
};

export default RoleBasedContent;
