
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Client } from '@/services/types';
import { Staff } from '@/services/supabaseApi';
import { ClientCredentials } from './ClientCredentials';
import { ClientActions } from './ClientActions';

interface ClientCardProps {
  client?: Client;
  staff?: Staff;
  showPassword: boolean;
  onTogglePassword: () => void;
  onCopyCredentials: () => void;
  onTogglePortal: () => void;
  onDeleteClient: () => void;
}

export const ClientCard = ({
  client,
  staff,
  showPassword,
  onTogglePassword,
  onCopyCredentials,
  onTogglePortal,
  onDeleteClient
}: ClientCardProps) => {
  // Determine which entity we're working with
  const entity = client || staff;
  const isStaff = !!staff;
  
  if (!entity) return null;

  const name = isStaff ? staff!.name : client!.name;
  const email = isStaff ? staff!.email : client!.email;
  const phone = isStaff ? staff!.phone : client!.phone;
  const id = entity.id;
  
  // For staff, use email as login ID and generate a temporary password display
  const loginId = isStaff ? email : client!.clientId;
  const loginPassword = isStaff ? '••••••••••' : client!.clientPassword;
  const portalStatus = isStaff ? 'Staff Access' : (client!.isPortalEnabled ? 'Portal Active' : 'Portal Inactive');
  const isPortalEnabled = isStaff ? true : client!.isPortalEnabled;

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{name}</h3>
              <Badge variant={isPortalEnabled ? 'default' : 'secondary'}>
                {portalStatus}
              </Badge>
              {isStaff && (
                <Badge variant="outline">Staff Member</Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>{email}</p>
              {phone && <p>{phone}</p>}
            </div>

            {loginId && (
              <ClientCredentials
                clientId={loginId}
                clientPassword={isStaff ? 'Use signup email/password' : loginPassword}
                showPassword={showPassword}
                onTogglePassword={onTogglePassword}
                onCopyCredentials={onCopyCredentials}
              />
            )}
          </div>

          <ClientActions
            clientId={id}
            clientName={name}
            isPortalEnabled={isPortalEnabled}
            onTogglePortal={onTogglePortal}
            onDeleteClient={onDeleteClient}
          />
        </div>
      </CardContent>
    </Card>
  );
};
