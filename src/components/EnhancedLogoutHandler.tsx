import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const EnhancedLogoutHandler: React.FC = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      
      // Clear any cached data
      localStorage.removeItem('salon-schedule-cache');
      localStorage.removeItem('appointment-cache');
      sessionStorage.clear();
      
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out",
      });
      
      // Force navigation to landing page
      navigate('/', { replace: true });
      
      // Force page reload to clear any lingering state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
};