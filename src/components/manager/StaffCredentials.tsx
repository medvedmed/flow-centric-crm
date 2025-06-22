
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff } from 'lucide-react';

interface StaffCredentialsProps {
  staffId: string;
  staffPassword: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  onCopyCredentials: () => void;
}

export const StaffCredentials = ({
  staffId,
  staffPassword,
  showPassword,
  onTogglePassword,
  onCopyCredentials
}: StaffCredentialsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 p-3 bg-muted rounded-lg">
      <div>
        <Label className="text-xs text-muted-foreground">Staff ID</Label>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono bg-background px-2 py-1 rounded">
            {staffId}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCopyCredentials}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div>
        <Label className="text-xs text-muted-foreground">Password</Label>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono bg-background px-2 py-1 rounded">
            {showPassword ? staffPassword : '••••••••••'}
          </code>
          <Button
            size="sm"
            variant="ghost"
            onClick={onTogglePassword}
          >
            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
