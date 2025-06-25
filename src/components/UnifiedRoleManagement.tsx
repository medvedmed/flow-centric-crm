
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleManagement } from '@/hooks/usePermissions';
import { useRoleBasedUI } from '@/hooks/useRoleBasedUI';
import { Users, Shield, Settings, Eye, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { AppRole, PermissionArea, permissionApi } from '@/services/permissionApi';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StaffInviteDialog from "./StaffInviteDialog";

const PERMISSION_AREAS: { key: PermissionArea; label: string; description: string }[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'View main dashboard and analytics' },
  { key: 'appointments', label: 'Appointments', description: 'Manage client appointments' },
  { key: 'clients', label: 'Clients', description: 'Manage client information' },
  { key: 'staff_management', label: 'Staff Management', description: 'Manage staff members' },
  { key: 'services', label: 'Services', description: 'Manage salon services' },
  { key: 'products', label: 'Products', description: 'Manage salon products' },
  { key: 'inventory', label: 'Inventory', description: 'Manage salon inventory' },
  { key: 'finance', label: 'Finance', description: 'View financial reports and transactions' },
  { key: 'reports', label: 'Reports', description: 'View business reports' },
  { key: 'settings', label: 'Settings', description: 'Manage system settings' },
  { key: 'schedule_management', label: 'Schedule Management', description: 'Manage staff schedules' },
  { key: 'time_off_requests', label: 'Time Off Requests', description: 'Manage time off requests' }
];

const ROLES: { key: AppRole; label: string; description: string; color: string }[] = [
  { key: 'salon_owner', label: 'Salon Owner', description: 'Full access to all features', color: 'bg-purple-100 text-purple-800' },
  { key: 'manager', label: 'Manager', description: 'Manages staff and operations', color: 'bg-blue-100 text-blue-800' },
  { key: 'staff', label: 'Staff', description: 'Provides services to clients', color: 'bg-green-100 text-green-800' },
  { key: 'receptionist', label: 'Receptionist', description: 'Manages front desk operations', color: 'bg-orange-100 text-orange-800' }
];

export const UnifiedRoleManagement: React.FC = () => {
  const { rolePermissions, isLoading, error, refetchPermissions } = useRoleManagement();
  const { getRoleDisplayInfo } = useRoleBasedUI();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<AppRole>('manager');
  const [updating, setUpdating] = useState<string | null>(null);

  const getPermissionForArea = (role: AppRole, area: PermissionArea) => {
    return rolePermissions?.find(p => p.role === role && p.area === area);
  };

  const handlePermissionToggle = async (
    role: AppRole,
    area: PermissionArea,
    permission: 'canView' | 'canCreate' | 'canEdit' | 'canDelete',
    value: boolean
  ) => {
    const key = `${role}-${area}-${permission}`;
    setUpdating(key);

    try {
      const currentPermission = getPermissionForArea(role, area);
      if (!currentPermission) return;

      await permissionApi.updateRolePermission(role, area, {
        ...currentPermission,
        [permission]: value
      });

      await refetchPermissions();
      
      toast({
        title: "Permission Updated",
        description: `${permission} permission for ${area.replace('_', ' ')} has been ${value ? 'enabled' : 'disabled'} for ${role}.`
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update permission. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load role management data. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Permission Management
            </CardTitle>
            <CardDescription>
              Manage user roles and configure detailed permissions for your salon management system.
            </CardDescription>
          </div>
          <StaffInviteDialog />
        </CardHeader>
        <CardContent>
          <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as AppRole)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {ROLES.filter(role => role.key !== 'salon_owner').map(role => (
                <TabsTrigger key={role.key} value={role.key} className="flex items-center gap-2">
                  <Badge className={`text-xs ${role.color}`}>
                    {role.label}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {ROLES.filter(role => role.key !== 'salon_owner').map(role => (
              <TabsContent key={role.key} value={role.key} className="space-y-4">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Badge className={role.color}>{role.label}</Badge>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission Area</TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Plus className="h-3 w-3" />
                            Create
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Edit className="h-3 w-3" />
                            Edit
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PERMISSION_AREAS.map(area => {
                        const permission = getPermissionForArea(role.key, area.key);
                        
                        return (
                          <TableRow key={area.key}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{area.label}</div>
                                <div className="text-sm text-gray-500">{area.description}</div>
                              </div>
                            </TableCell>
                            {[
                              { key: 'canView', permission: 'canView' },
                              { key: 'canCreate', permission: 'canCreate' },
                              { key: 'canEdit', permission: 'canEdit' },
                              { key: 'canDelete', permission: 'canDelete' }
                            ].map(({ key, permission: permKey }) => {
                              const isUpdating = updating === `${role.key}-${area.key}-${permKey}`;
                              
                              return (
                                <TableCell key={key} className="text-center">
                                  <Switch
                                    checked={Boolean(permission?.[permKey as keyof typeof permission]) || false}
                                    onCheckedChange={(value) =>
                                      handlePermissionToggle(
                                        role.key,
                                        area.key,
                                        permKey as 'canView' | 'canCreate' | 'canEdit' | 'canDelete',
                                        value
                                      )
                                    }
                                    disabled={isUpdating}
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
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Salon owners have full access to all features by default. 
              These settings control what managers, staff, and receptionists can access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedRoleManagement;
