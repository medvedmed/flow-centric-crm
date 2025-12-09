
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, User, Lock, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StaffCredentialsCardProps {
  staff: {
    id: string;
    name: string;
    email?: string;
    staffLoginId?: string;
    staffLoginPassword?: string;
    hasCredentials?: boolean;
    status?: string;
  };
  onCredentialsReset?: () => void;
}

export const StaffCredentialsCard: React.FC<StaffCredentialsCardProps> = ({ staff, onCredentialsReset }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyCredentials = () => {
    if (!staff.staffLoginId) {
      toast({
        title: "No Credentials",
        description: "This staff member doesn't have login credentials yet.",
        variant: "destructive",
      });
      return;
    }
    
    const credentials = `Staff Login Credentials for ${staff.name}:
Staff ID: ${staff.staffLoginId}
${newPassword ? `Password: ${newPassword}\n\nIMPORTANT: Save this password now - it cannot be viewed again for security reasons.` : 'Password: (Use the password you were given when this account was created, or reset it)'}

Portal URL: ${window.location.origin}/staff-portal`;
    
    navigator.clipboard.writeText(credentials);
    toast({
      title: "Credentials Copied",
      description: `${staff.name}'s login information copied to clipboard.`,
    });
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      // Generate a new random password
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let generatedPassword = '';
      for (let i = 0; i < 10; i++) {
        generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Call the set_staff_password function which will hash the password
      const { error } = await supabase.rpc('set_staff_password', {
        target_staff_id: staff.id,
        new_password: generatedPassword
      });

      if (error) throw error;

      // Show the new password temporarily
      setNewPassword(generatedPassword);
      
      toast({
        title: "Password Reset Successful",
        description: "New password generated. Copy it now - it won't be shown again!",
      });

      onCredentialsReset?.();
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const hasCredentials = staff.hasCredentials || (staff.staffLoginId && staff.staffLoginPassword);

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
            <Shield className="w-3 h-3 mr-1" />
            Secured
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
            {newPassword ? (
              <code className="bg-green-100 px-2 py-1 rounded text-sm font-mono text-green-800 border border-green-300">
                {newPassword}
              </code>
            ) : (
              <span className="text-sm text-muted-foreground italic">
                Securely hashed (cannot be viewed)
              </span>
            )}
          </div>
        </div>

        {newPassword && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800 font-medium">
              ⚠️ Copy this password now! It won't be shown again for security reasons.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCredentials}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPassword}
            disabled={isResetting}
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <p className="font-medium mb-1">Share with {staff.name}:</p>
          <p>• Staff ID: <code className="bg-gray-100 px-1 rounded">{staff.staffLoginId}</code></p>
          <p>• Portal: <code className="bg-gray-100 px-1 rounded">{window.location.origin}/staff-portal</code></p>
          <p className="mt-2 text-muted-foreground">
            Passwords are securely hashed and cannot be viewed. Use "Reset Password" to generate a new one.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
