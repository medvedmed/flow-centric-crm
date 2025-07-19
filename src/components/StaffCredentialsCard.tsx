
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Copy, User, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StaffCredentialsCardProps {
  staff: {
    id: string;
    name: string;
    email?: string;
    staffLoginId?: string;
    staffLoginPassword?: string;
    status?: string;
  };
}

export const StaffCredentialsCard: React.FC<StaffCredentialsCardProps> = ({ staff }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleCopyCredentials = () => {
    if (!staff.staffLoginId || !staff.staffLoginPassword) return;
    
    const credentials = `Staff Login Credentials for ${staff.name}:
Staff ID: ${staff.staffLoginId}
Password: ${staff.staffLoginPassword}

Please keep these credentials secure and share them only with ${staff.name}.`;
    
    navigator.clipboard.writeText(credentials);
    toast({
      title: "Credentials Copied",
      description: `${staff.name}'s login credentials copied to clipboard.`,
    });
  };

  if (!staff.staffLoginId || !staff.staffLoginPassword) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <User className="w-4 h-4" />
            <span className="text-sm">Login credentials not generated yet</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Staff Login Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-white rounded border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Staff ID:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{staff.staffLoginId}</code>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-white rounded border">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Password:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {showPassword ? staff.staffLoginPassword : '••••••••••'}
            </code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyCredentials}
          className="w-full"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Credentials
        </Button>

        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
          Share these credentials securely with {staff.name} so they can access their staff portal.
        </div>
      </CardContent>
    </Card>
  );
};
