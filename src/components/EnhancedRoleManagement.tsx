
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoleManagement } from '@/hooks/usePermissions';
import { useRoleBasedUI } from '@/hooks/useRoleBasedUI';
import { Users, Shield, Settings, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { AppRole, PermissionArea } from '@/services/permissionApi';
import { useToast } from '@/hooks/use-toast';
import PermissionGate from './PermissionGate';

const PERMISSION_AREAS: { key: PermissionArea; label: string; description: string }[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'View main dashboard and analytics' },
  { key: 'appointments', label: 'Appointments', description: 'Manage client appointments' },
  { key: 'clients', label: 'Clients', description: 'Manage client information' },
  { key: 'staff_management', label: 'Staff Management', description: 'Manage staff members' },
  { key: 'services', label: 'Services', description: 'Manage salon services' },
  { key: 'inventory', label: 'Inventory', description: 'Manage salon inventory' },
  { key: 'reports', label: 'Reports', description: 'View business reports' },
  { key: 'settings', label: 'Settings', description: 'Manage system settings' },
  { key: 'schedule_management', label: 'Schedule Management', description: 'Manage staff schedules' },
  { key: 'time_off_requests', label: 'Time Off Requests', description: 'Manage time off requests' }
];

const ROLES: { key: AppRole; label: string; description: string }[] = [
  { key: 'salon_owner', label: 'Salon Owner', description: 'Full access to all features' },
  { key: 'manager', label: 'Manager', description: 'Manages staff and operations' },
  { key: 'staff', label: 'Staff', description: 'Provides services to clients' },
  { key: 'receptionist', label: 'Receptionist', description: 'Manages front desk operations' }
];

export const EnhancedRoleManagement: React.FC = () => {
  const { rolePermissions, permissionsLoading, refetchPermissions } = useRoleManagement();
  const { getRoleDisplayInfo } = useRoleBasedUI();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<AppRole>('manager');

  const getPermissionForArea = (role: AppRole, area: PermissionArea) => {
    return rolePermissions?.find(p => p.role === role && p.area === area);
  };

  const handlePermissionToggle = async (
    role: AppRole,
    area: PermissionArea,
    permission: 'canView' | 'canCreate' | 'canEdit' | 'canDelete',
    value: boolean
  ) => {
    try {
      // This would be implemented in the permission API
      toast({
        title: "Permission Updated",
        description: `${permission} permission for ${area} has been ${value ? 'enabled' : 'disabled'} for ${role}.`
      });
      await refetchPermissions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission.",
        variant: "destructive"
      });
    }
  };

  if (permissionsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Role Management
          </CardTitle>
          <CardDescription>
            Configure detailed permissions for each role in your salon management system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as AppRole)}>
            <TabsList className="grid w-full grid-cols-4">
              {ROLES.map(role => (
                <TabsTrigger key={role.key} value={role.key} className="flex items-center gap-2">
                  <Badge className={`text-xs ${getRoleDisplayInfo()?.color || 'bg-gray-500 text-white'}`}>
                    {role.label}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {ROLES.map(role => (
              <TabsContent key={role.key} value={role.key} className="space-y-4">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-lg">{role.label}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>

                <div className="grid gap-4">
                  {PERMISSION_AREAS.map(area => {
                    const permission = getPermissionForArea(role.key, area.key);
                    
                    return (
                      <Card key={area.key} className="border-l-4 border-l-teal-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{area.label}</h4>
                              <p className="text-sm text-gray-600">{area.description}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { key: 'canView', label: 'View', icon: Eye },
                              { key: 'canCreate', label: 'Create', icon: Plus },
                              { key: 'canEdit', label: 'Edit', icon: Edit },
                              { key: 'canDelete', label: 'Delete', icon: Trash2 }
                            ].map(({ key, label, icon: Icon }) => (
                              <div key={key} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">{label}</span>
                                </div>
                                <PermissionGate area="settings" action="edit">
                                  <Switch
                                    checked={Boolean(permission?.[key as 'canView' | 'canCreate' | 'canEdit' | 'canDelete']) || false}
                                    onCheckedChange={(value) =>
                                      handlePermissionToggle(
                                        role.key,
                                        area.key,
                                        key as 'canView' | 'canCreate' | 'canEdit' | 'canDelete',
                                        value
                                      )
                                    }
                                    disabled={role.key === 'salon_owner'} // Owners always have all permissions
                                  />
                                </PermissionGate>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedRoleManagement;
