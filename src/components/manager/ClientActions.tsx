
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ClientActionsProps {
  clientId: string;
  clientName: string;
  isPortalEnabled: boolean;
  onTogglePortal: () => void;
  onDeleteClient: () => void;
}

export const ClientActions = ({
  clientId,
  clientName,
  isPortalEnabled,
  onTogglePortal,
  onDeleteClient
}: ClientActionsProps) => {
  return (
    <div className="flex items-center gap-2 ml-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor={`portal-${clientId}`} className="text-sm">
          Portal Access
        </Label>
        <Switch
          id={`portal-${clientId}`}
          checked={isPortalEnabled || false}
          onCheckedChange={onTogglePortal}
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
              Are you sure you want to delete {clientName}? This action cannot be undone.
              All appointments and data associated with this client will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteClient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
