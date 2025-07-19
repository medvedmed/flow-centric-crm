
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StaffLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffLoginDialog: React.FC<StaffLoginDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!staffId || !password) {
        setError('Please enter both Staff ID and Password');
        return;
      }

      console.log('Attempting staff login with ID:', staffId);

      // Call the authenticate_staff function
      const { data, error: authError } = await supabase
        .rpc('authenticate_staff', {
          login_id: staffId.trim(),
          login_password: password.trim()
        });

      console.log('Authentication response:', data);

      if (authError) {
        console.error('Authentication error:', authError);
        setError('Login failed. Please check your credentials.');
        return;
      }

      if (!data || data.length === 0) {
        setError('Invalid Staff ID or Password. Please try again.');
        return;
      }

      const staffData = data[0];
      
      if (!staffData.is_valid) {
        setError('Invalid credentials or account is inactive. Please contact your manager.');
        return;
      }

      // Store staff session data
      const sessionData = {
        id: staffData.staff_id,
        name: staffData.staff_name,
        email: staffData.staff_email,
        salon_id: staffData.salon_id,
        login_id: staffId,
        authenticated_at: new Date().toISOString()
      };

      localStorage.setItem('staff_session', JSON.stringify(sessionData));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${staffData.staff_name}!`,
      });

      // Reset form
      setStaffId('');
      setPassword('');
      onSuccess();

    } catch (error: any) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Staff Portal Login
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="staffId" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Staff ID
            </Label>
            <Input
              id="staffId"
              type="text"
              placeholder="Enter your Staff ID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="font-mono"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="font-mono"
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">Need your login credentials?</p>
            <p>Contact your salon manager to get your Staff ID and Password.</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
