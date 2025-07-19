
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Copy, User, Lock, AlertTriangle } from 'lucide-react';
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
    if (!staff.staffLoginId || !staff.staffLoginPassword) {
      toast({
        title: "No Credentials",
        description: "This staff member doesn't have login credentials yet.",
        variant: "destructive",
      });
      return;
    }
    
    const credentials = `Staff Login Credentials for ${staff.name}:
Staff ID: ${staff.staffLoginId}
Password: ${staff.staffLoginPassword}

Please keep these credentials secure and share them only with ${staff.name}.
They can access their staff portal at: ${window.location.origin}/staff-portal`;
    
    navigator.clipboard.writeText(credentials);
    toast({
      title: "Credentials Copied",
      description: `${staff.name}'s login credentials copied to clipboard.`,
    });
  };

  const hasCredentials = staff.staffLoginId && staff.staffLoginPassword;

  if (!hasCredentials) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Login credentials needed</p>
              <p className="text-xs text-amber-700 mt-1">
                Click "Generate Missing Credentials" to create login access for this staff member.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Staff Login Credentials
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white rounded border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Staff ID:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
              {staff.staffLoginId}
            </code>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded border">
          <div className="flex items-center gap-2 flex-1">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Password:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono flex-1">
              {showPassword ? staff.staffLoginPassword : '••••••••••'}
            </code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2"
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

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <p className="font-medium mb-1">Share these credentials with {staff.name}:</p>
          <p>• Staff ID: <code className="bg-gray-100 px-1 rounded">{staff.staffLoginId}</code></p>
          <p>• Portal URL: <code className="bg-gray-100 px-1 rounded">{window.location.origin}/staff-portal</code></p>
        </div>
      </CardContent>
    </Card>
  );
};
