
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useClients, useUpdateClient, useDeleteClient, useStaff, useDeleteStaff } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';
import { ClientSearch } from './manager/ClientSearch';
import { ClientCard } from './manager/ClientCard';

const ManagerSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Fetch both clients and staff
  const { data: clientsData, isLoading: clientsLoading } = useClients(searchTerm, 1, 100);
  const { data: staffData = [], isLoading: staffLoading } = useStaff();
  
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const deleteStaff = useDeleteStaff();
  const { toast } = useToast();

  const clients = clientsData?.data || [];
  const staff = staffData || [];

  const handleTogglePortal = async (entityId: string, currentStatus: boolean, isStaff: boolean) => {
    if (isStaff) {
      // Staff always have access, no need to toggle
      toast({
        title: 'Info',
        description: 'Staff members always have system access',
      });
      return;
    }

    try {
      await updateClient.mutateAsync({
        id: entityId,
        client: { isPortalEnabled: !currentStatus }
      });
      toast({
        title: 'Success',
        description: `Client portal ${!currentStatus ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update portal status',
        variant: 'destructive',
      });
    }
  };

  const handleCopyCredentials = (loginId: string, password: string, isStaff: boolean) => {
    if (isStaff) {
      const credentials = `Login Email: ${loginId}\nPassword: Use signup credentials`;
      navigator.clipboard.writeText(credentials);
      toast({
        title: 'Copied',
        description: 'Staff login details copied to clipboard',
      });
    } else {
      const credentials = `Client ID: ${loginId}\nPassword: ${password}`;
      navigator.clipboard.writeText(credentials);
      toast({
        title: 'Copied',
        description: 'Client credentials copied to clipboard',
      });
    }
  };

  const handleDeleteEntity = async (entityId: string, entityName: string, isStaff: boolean) => {
    try {
      if (isStaff) {
        await deleteStaff.mutateAsync(entityId);
        toast({
          title: 'Success',
          description: `${entityName} has been removed from staff successfully`,
        });
      } else {
        await deleteClient.mutateAsync(entityId);
        toast({
          title: 'Success',
          description: `${entityName} has been deleted successfully`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete ${isStaff ? 'staff member' : 'client'}`,
        variant: 'destructive',
      });
    }
  };

  const togglePasswordVisibility = (entityId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [entityId]: !prev[entityId]
    }));
  };

  // Filter both clients and staff based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.clientId && client.clientId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isLoading = clientsLoading || staffLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading clients and staff...</div>
        </CardContent>
      </Card>
    );
  }

  const totalEntities = filteredClients.length + filteredStaff.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client & Staff Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage client portal access, staff system access, credentials, and account settings
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClientSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="space-y-4">
            {totalEntities === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No clients or staff found matching your search.' : 'No clients or staff added yet.'}
              </div>
            ) : (
              <>
                {/* Staff Members */}
                {filteredStaff.map((member) => (
                  <ClientCard
                    key={`staff-${member.id}`}
                    staff={member}
                    showPassword={showPasswords[member.id] || false}
                    onTogglePassword={() => togglePasswordVisibility(member.id)}
                    onCopyCredentials={() => 
                      handleCopyCredentials(member.email || '', '', true)
                    }
                    onTogglePortal={() => handleTogglePortal(member.id, true, true)}
                    onDeleteClient={() => handleDeleteEntity(member.id, member.name, true)}
                  />
                ))}
                
                {/* Clients */}
                {filteredClients.map((client) => (
                  <ClientCard
                    key={`client-${client.id}`}
                    client={client}
                    showPassword={showPasswords[client.id] || false}
                    onTogglePassword={() => togglePasswordVisibility(client.id)}
                    onCopyCredentials={() => 
                      client.clientPassword && handleCopyCredentials(client.clientId!, client.clientPassword, false)
                    }
                    onTogglePortal={() => handleTogglePortal(client.id, client.isPortalEnabled || false, false)}
                    onDeleteClient={() => handleDeleteEntity(client.id, client.name, false)}
                  />
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerSection;
