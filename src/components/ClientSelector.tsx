
import React, { useState } from 'react';
import { useClients } from '@/hooks/useCrmData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCreateClient } from '@/hooks/useCrmData';
import { useToast } from '@/hooks/use-toast';

interface ClientSelectorProps {
  value: string;
  onValueChange: (clientId: string, clientName: string, clientPhone?: string) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onValueChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const { data: clientsData, isLoading } = useClients(searchTerm, 1, 50);
  const createClient = useCreateClient();
  const { toast } = useToast();

  const clients = clientsData?.data || [];
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email) return;

    try {
      // Create client data with required fields
      const clientData = {
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        status: 'New' as const, // Required field
        // Optional fields with defaults
        assignedStaff: null,
        notes: null,
        tags: null,
        totalSpent: 0,
        visits: 0,
        preferredStylist: null,
        lastVisit: null,
        clientId: null,
        clientPassword: null,
        isPortalEnabled: false
      };

      const createdClient = await createClient.mutateAsync(clientData);
      onValueChange(createdClient.id, createdClient.name, createdClient.phone || undefined);
      setIsAddingNew(false);
      setNewClient({ name: '', email: '', phone: '' });
      toast({
        title: "Client Added",
        description: `${createdClient.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Select value={value} onValueChange={(clientId) => {
            const client = clients.find(c => c.id === clientId);
            if (client) {
              onValueChange(clientId, client.name, client.phone || undefined);
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading clients...</SelectItem>
              ) : filteredClients.length === 0 ? (
                <SelectItem value="no-clients" disabled>No clients found</SelectItem>
              ) : (
                filteredClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex flex-col">
                      <span>{client.name}</span>
                      <span className="text-sm text-muted-foreground">{client.email}</span>
                      {client.phone && (
                        <span className="text-sm text-muted-foreground">{client.phone}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Name *</Label>
                <Input
                  id="clientName"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Client name"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="Client email"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="Client phone"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateClient}
                  disabled={!newClient.name || !newClient.email || createClient.isPending}
                  className="flex-1"
                >
                  {createClient.isPending ? "Adding..." : "Add Client"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
