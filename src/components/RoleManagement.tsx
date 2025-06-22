
import React, { useState } from 'react';
import { useRoleManagement } from '@/hooks/usePermissions';
import { permissionApi, AppRole, PermissionArea } from '@/services/permissionApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Settings } from 'lucide-react';

const roleColors: Record<AppRole, string> = {
  salon_owner: 'bg-purple-100 text-purple-800 border-purple-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  staff: 'bg-green-100 text-green-800 border-green-200',
  receptionist: 'bg-orange-100 text-orange-800 border-orange-200'
};

const areaLabels: Record<PermissionArea, string> = {
  dashboard: 'Dashboard',
  appointments: 'Appointments',
  clients: 'Clients',
  staff_management: 'Staff Management',
  services: 'Services',
  inventory: 'Inventory',
  reports: 'Reports',
  settings: 'Settings',
  schedule_management: 'Schedule Management',
  time_off_requests: 'Time Off Requests'
};

export const RoleManagement: React.FC = () => {
  const { rolePermissions, permissionsLoading, refetchPermissions } = useRoleManagement();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const handlePermissionChange = async (
    role: AppRole,
    area: PermissionArea,
    permissionType: 'canView' | 'canCreate' | 'canEdit' | 'canDelete',
    value: boolean
  ) => {
    const key = `${role}-${area}-${permissionType}`;
    setUpdating(key);

    try {
      const currentPermission = rolePermissions?.find(p => p.role === role && p.area === area);
      if (!currentPermission) return;

      await permissionApi.updateRolePermission(role, area, {
        ...currentPermission,
        [permissionType]: value
      });

      await refetchPermissions();
      
      toast({
        title: "Permission Updated",
        description: `${role} ${permissionType} permission for ${areaLabels[area]} has been ${value ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (permissionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const roles: AppRole[] = ['manager', 'staff', 'receptionist'];
  const permissionTypes = [
    { key: 'canView' as const, label: 'View' },
    { key: 'canCreate' as const, label: 'Create' },
    { key: 'canEdit' as const, label: 'Edit' },
    { key: 'canDelete' as const, label: 'Delete' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            Configure what each role can access and modify in your salon management system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {roles.map(role => (
              <div key={role} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={roleColors[role]}>
                    {role.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Area</TableHead>
                        {permissionTypes.map(type => (
                          <TableHead key={type.key} className="text-center">
                            {type.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(areaLabels).map(([area, label]) => {
                        const permission = rolePermissions?.find(
                          p => p.role === role && p.area === area as PermissionArea
                        );
                        
                        if (!permission) return null;

                        return (
                          <TableRow key={area}>
                            <TableCell className="font-medium">{label}</TableCell>
                            {permissionTypes.map(type => {
                              const isUpdating = updating === `${role}-${area}-${type.key}`;
                              const isDisabled = role === 'salon_owner' || isUpdating;
                              
                              return (
                                <TableCell key={type.key} className="text-center">
                                  <Switch
                                    checked={permission[type.key]}
                                    disabled={isDisabled}
                                    onCheckedChange={(value) =>
                                      handlePermissionChange(
                                        role,
                                        area as PermissionArea,
                                        type.key,
                                        value
                                      )
                                    }
                                  />
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role Assignment
          </CardTitle>
          <CardDescription>
            Assign roles to your team members to control their access levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">User Role Assignment</p>
            <p className="text-sm mb-4">
              This feature allows you to invite team members and assign them specific roles.
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
