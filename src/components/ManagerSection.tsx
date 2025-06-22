
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Eye, EyeOff, Copy, RefreshCw, Search, Users } from 'lucide-react';
import { useClients, useUpdateClient, useDeleteClient } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Client List */}
          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No clients found matching your search.' : 'No clients added yet.'}
              </div>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{client.name}</h3>
                          <Badge variant={client.isPortalEnabled ? 'default' : 'secondary'}>
                            {client.isPortalEnabled ? 'Portal Active' : 'Portal Inactive'}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>{client.email}</p>
                          {client.phone && <p>{client.phone}</p>}
                        </div>

                        {client.clientId && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-muted rounded-lg">
                            <div>
                              <Label className="text-xs text-muted-foreground">Client ID</Label>
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                                  {client.clientId}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => client.clientPassword && handleCopyCredentials(client.clientId, client.clientPassword)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {client.clientPassword && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Password</Label>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                                    {showPasswords[client.id] ? client.clientPassword : '••••••••••'}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => togglePasswordVisibility(client.id)}
                                  >
                                    {showPasswords[client.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`portal-${client.id}`} className="text-sm">
                            Portal Access
                          </Label>
                          <Switch
                            id={`portal-${client.id}`}
                            checked={client.isPortalEnabled || false}
                            onCheckedChange={() => handleTogglePortal(client.id, client.isPortalEnabled || false)}
                          />
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Client</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {client.name}? This action cannot be undone.
                                All appointments and data associated with this client will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClient(client.id, client.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Client
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerSection;
