
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { UserCircle, Lock, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StaffLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (staffData: any) => void;
}

export const StaffLoginDialog: React.FC<StaffLoginDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginId.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both login ID and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Call the authenticate_staff function
      const { data, error } = await supabase
        .rpc('authenticate_staff', {
          login_id: loginId.trim(),
          login_password: password.trim()
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const staffData = data[0];
        
        if (staffData.is_valid) {
          // Store staff session in localStorage
          const sessionData = {
            id: staffData.staff_id,
            name: staffData.staff_name,
            email: staffData.staff_email,
            salon_id: staffData.salon_id,
            loginId: loginId.trim(),
            loginTime: new Date().toISOString()
          };
          
          localStorage.setItem('staff_session', JSON.stringify(sessionData));
          
          toast({
            title: "Success",
            description: `Welcome, ${staffData.staff_name}!`,
          });

          onSuccess(sessionData);
          onClose();
          
          // Reset form
          setLoginId('');
          setPassword('');
        } else {
          toast({
            title: "Invalid Credentials",
            description: "Login ID or password is incorrect",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Login ID or password is incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Staff login error:', error);
      toast({
        title: "Error",
        description: "Failed to authenticate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-violet-600" />
            Staff Login
          </DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginId" className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Staff Login ID
                </Label>
                <Input
                  id="loginId"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Enter your staff login ID"
                  disabled={loading}
                  className="uppercase"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
