
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Client } from '@/services/types';
import { ClientCredentials } from './ClientCredentials';
import { ClientActions } from './ClientActions';

interface ClientCardProps {
  client: Client;
  showPassword: boolean;
  onTogglePassword: () => void;
  onCopyCredentials: () => void;
  onTogglePortal: () => void;
  onDeleteClient: () => void;
}

export const ClientCard = ({
  client,
  showPassword,
  onTogglePassword,
  onCopyCredentials,
  onTogglePortal,
  onDeleteClient
}: ClientCardProps) => {
  return (
    <Card className="relative">
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

            {client.clientId && client.clientPassword && (
              <ClientCredentials
                clientId={client.clientId}
                clientPassword={client.clientPassword}
                showPassword={showPassword}
                onTogglePassword={onTogglePassword}
                onCopyCredentials={onCopyCredentials}
              />
            )}
          </div>

          <ClientActions
            clientId={client.id}
            clientName={client.name}
            isPortalEnabled={client.isPortalEnabled || false}
            onTogglePortal={onTogglePortal}
            onDeleteClient={onDeleteClient}
          />
        </div>
      </CardContent>
    </Card>
  );
};
