
import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useCrmData';
import { Input } from '@/components/ui/input';

interface ClientSelectorProps {
  value: string;
  onValueChange: (clientName: string, clientId?: string, clientPhone?: string) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onValueChange
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientPhone, setNewClientPhone] = useState('');

  const { data: clientsData } = useClients(searchTerm, 1, 50, 'all');
  const clients = clientsData?.data || [];

  const handleSelect = (client: any) => {
    onValueChange(client.name, client.id, client.phone);
    setOpen(false);
    setIsNewClient(false);
  };

  const handleNewClient = () => {
    if (searchTerm.trim()) {
      onValueChange(searchTerm.trim(), undefined, newClientPhone);
      setOpen(false);
      setIsNewClient(false);
      setNewClientPhone('');
    }
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    // If typing a new name that doesn't match existing clients, prepare for new client
    if (search && !clients.some(client => 
      client.name.toLowerCase().includes(search.toLowerCase())
    )) {
      setIsNewClient(true);
    } else {
      setIsNewClient(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {value || "Select or enter client name..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search clients or enter new name..."
            value={searchTerm}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {searchTerm ? (
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-600">No existing client found.</p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Phone number (optional)"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                    />
                    <Button
                      onClick={handleNewClient}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add "{searchTerm}" as new client
                    </Button>
                  </div>
                </div>
              ) : (
                "Start typing to search clients..."
              )}
            </CommandEmpty>
            {clients.length > 0 && (
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    onSelect={() => handleSelect(client)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === client.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{client.name}</div>
                      {client.phone && (
                        <div className="text-sm text-gray-500">{client.phone}</div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {isNewClient && searchTerm && (
              <CommandGroup>
                <CommandItem onSelect={() => {}}>
                  <div className="w-full p-2 space-y-2">
                    <div className="flex items-center gap-2 font-medium">
                      <Plus className="w-4 h-4" />
                      Add new client: {searchTerm}
                    </div>
                    <Input
                      placeholder="Phone number (optional)"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewClient();
                      }}
                      className="w-full"
                      size="sm"
                    >
                      Add Client
                    </Button>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
