
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useStaff, useDeleteStaff } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';
import { StaffSearch } from './manager/StaffSearch';
import { StaffCard } from './manager/StaffCard';
import { EditStaffDialog } from './EditStaffDialog';
import { Staff } from '@/services/types';

const ManagerSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  
  const { data: staffData = [], isLoading: staffLoading } = useStaff();
  const deleteStaff = useDeleteStaff();
  const { toast } = useToast();

  const staff = staffData || [];

  const handleCopyCredentials = (staffId: string, password: string) => {
    const credentials = `Staff ID: ${staffId}\nPassword: ${password}`;
    navigator.clipboard.writeText(credentials);
    toast({
      title: 'Copied',
      description: 'Staff credentials copied to clipboard',
    });
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    try {
      await deleteStaff.mutateAsync(staffId);
      toast({
        title: 'Success',
        description: `${staffName} has been removed successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete staff member',
        variant: 'destructive',
      });
    }
  };

  const togglePasswordVisibility = (staffId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }));
  };

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.staffLoginId && member.staffLoginId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (staffLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading staff...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage staff members, their login credentials, and system access
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <StaffSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="space-y-4">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No staff found matching your search.' : 'No staff members added yet.'}
              </div>
            ) : (
              filteredStaff.map((member) => (
                <StaffCard
                  key={member.id}
                  staff={member}
                  showPassword={showPasswords[member.id] || false}
                  onTogglePassword={() => togglePasswordVisibility(member.id)}
                  onCopyCredentials={() => 
    member.staff_login_id && member.staff_login_password && 
                    handleCopyCredentials(member.staff_login_id, member.staff_login_password)
                  }
                  onEditStaff={() => setEditingStaff(member)}
                  onDeleteStaff={() => handleDeleteStaff(member.id, member.name)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <EditStaffDialog
        staff={editingStaff}
        open={!!editingStaff}
        onOpenChange={(open) => !open && setEditingStaff(null)}
      />
    </div>
  );
};

export default ManagerSection;
