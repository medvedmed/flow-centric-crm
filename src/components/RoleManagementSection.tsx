import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { permissionApi, AppRole } from '@/services/permissionApi';
import { Users, UserPlus, Shield } from 'lucide-react';
import StaffInviteDialog from "./StaffInviteDialog";

export const RoleManagementSection = () => {
  const { toast } = useToast();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AppRole>('staff');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignRole = async () => {
    if (!newUserEmail || !newUserRole) {
      toast({
        title: "Validation Error",
        description: "Please enter an email and select a role",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      // In a real implementation, you would need to:
      // 1. Check if user exists in auth.users
      // 2. Get their user_id
      // 3. Assign the role
      // For now, we'll show a success message
      toast({
        title: "Role Assignment",
        description: `Role assignment feature will be implemented when user management is added`,
      });
      
      setNewUserEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const roleDescriptions = {
    salon_owner: "Full access to all features and settings",
    manager: "Can manage staff schedules, appointments, and reports",
    staff: "Can view own schedule and manage own appointments",
    receptionist: "Can book appointments and manage clients"
  };

  const roleColors = {
    salon_owner: "bg-purple-100 text-purple-800",
    manager: "bg-blue-100 text-blue-800", 
    staff: "bg-green-100 text-green-800",
    receptionist: "bg-orange-100 text-orange-800"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Manage your salon staff and their roles
            </CardDescription>
          </div>
          <StaffInviteDialog />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Descriptions */}
          <div className="space-y-3">
            <h3 className="font-medium">Available Roles</h3>
            {Object.entries(roleDescriptions).map(([role, description]) => (
              <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={roleColors[role as AppRole]}>
                    {role.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">{description}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Assign New Role */}
          <div className="border-t pt-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Assign Role to User
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="userEmail">User Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="userRole">Role</Label>
                <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAssignRole} 
                  disabled={isAssigning}
                  className="w-full"
                >
                  {isAssigning ? "Assigning..." : "Assign Role"}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> User management and role assignment will be fully functional once the user invitation system is implemented.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagementSection;
