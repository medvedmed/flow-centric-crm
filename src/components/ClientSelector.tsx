
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, User, Phone, Mail } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
}

interface ClientSelectorProps {
  selectedClientId?: string;
  onClientSelect: (client: Client) => void;
  onNewClient: (clientData: { name: string; email: string; phone?: string }) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClientId,
  onClientSelect,
  onNewClient
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', searchTerm, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', user?.id);

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('full_name').limit(10);
      if (error) throw error;
      
      // Map database fields to expected interface
      return (data || []).map(client => ({
        id: client.id,
        name: client.full_name,
        email: client.email || '',
        phone: client.phone || undefined,
        status: client.status || 'active'
      })) as Client[];
    },
    enabled: !!user?.id,
  });

  const handleNewClientSubmit = () => {
    if (newClientData.name && newClientData.email) {
      onNewClient(newClientData);
      setNewClientData({ name: '', email: '', phone: '' });
      setShowNewClientForm(false);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Client
        </Label>
        
        {/* Search Input */}
        <div className="relative mb-3">
          <Input
            placeholder="Search clients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Selected Client Display */}
        {selectedClient && (
          <Card className="mb-3 bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-green-900 truncate">{selectedClient.name}</p>
                  <div className="flex flex-col gap-1 text-sm text-green-700">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{selectedClient.email}</span>
                    </div>
                    {selectedClient.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client List */}
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading clients...</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {clients.map((client) => (
              <Card 
                key={client.id} 
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedClientId === client.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onClientSelect(client)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{client.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {clients.length === 0 && searchTerm && (
              <div className="text-center py-4 text-gray-500">
                No clients found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {/* New Client Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowNewClientForm(!showNewClientForm)}
          className="w-full mt-3 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </Button>

        {/* New Client Form */}
        {showNewClientForm && (
          <Card className="mt-3 border-dashed border-2 border-gray-300">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Add New Client</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-sm">Name *</Label>
                  <Input
                    placeholder="Client name"
                    value={newClientData.name}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm">Email *</Label>
                  <Input
                    type="email"
                    placeholder="client@example.com"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input
                    placeholder="Phone number"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNewClientSubmit}
                  disabled={!newClientData.name || !newClientData.email}
                  className="flex-1"
                >
                  Add Client
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewClientForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
