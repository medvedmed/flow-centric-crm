
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useClients, useUpdateClient, useDeleteClient } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';
import { ClientSearch } from './manager/ClientSearch';
import { ClientCard } from './manager/ClientCard';

const ManagerSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { data: clientsData, isLoading } = useClients(searchTerm, 1, 100);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const { toast } = useToast();

  const clients = clientsData?.data || [];

  const handleTogglePortal = async (clientId: string, currentStatus: boolean) => {
    try {
      await updateClient.mutateAsync({
        id: clientId,
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

  const handleCopyCredentials = (clientId: string, password: string) => {
    const credentials = `Client ID: ${clientId}\nPassword: ${password}`;
    navigator.clipboard.writeText(credentials);
    toast({
      title: 'Copied',
      description: 'Client credentials copied to clipboard',
    });
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    try {
      await deleteClient.mutateAsync(clientId);
      toast({
        title: 'Success',
        description: `${clientName} has been deleted successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete client',
        variant: 'destructive',
      });
    }
  };

  const togglePasswordVisibility = (clientId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.clientId && client.clientId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading clients...</div>
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
            Client Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage client portal access, credentials, and account settings
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClientSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No clients found matching your search.' : 'No clients added yet.'}
              </div>
            ) : (
              filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  showPassword={showPasswords[client.id] || false}
                  onTogglePassword={() => togglePasswordVisibility(client.id)}
                  onCopyCredentials={() => 
                    client.clientPassword && handleCopyCredentials(client.clientId!, client.clientPassword)
                  }
                  onTogglePortal={() => handleTogglePortal(client.id, client.isPortalEnabled || false)}
                  onDeleteClient={() => handleDeleteClient(client.id, client.name)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerSection;
