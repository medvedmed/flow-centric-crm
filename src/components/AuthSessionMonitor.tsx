
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AuthSessionMonitor = () => {
  const { user, session, refreshSession } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Monitor for session expiry
    const checkSession = async () => {
      if (user && session) {
        const now = Date.now();
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        
        // Check if session is about to expire (within 5 minutes)
        if (expiresAt - now < 5 * 60 * 1000 && expiresAt - now > 0) {
          console.log('Session expiring soon, attempting refresh...');
          try {
            await refreshSession();
          } catch (error) {
            console.error('Failed to refresh session:', error);
            toast({
              title: "Session Expiring",
              description: "Your session is about to expire. Please save your work and refresh the page.",
              variant: "destructive",
            });
          }
        }
        
        // Check if session has already expired
        if (expiresAt > 0 && now > expiresAt) {
          console.log('Session has expired');
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please refresh the page and log in again.",
            variant: "destructive",
          });
        }
      }
    };

    // Check session status every minute
    const interval = setInterval(checkSession, 60000);
    
    // Initial check
    checkSession();

    return () => clearInterval(interval);
  }, [user, session, refreshSession, toast]);

  useEffect(() => {
    // Listen for network errors that might indicate auth issues
    const handleNetworkError = (event: any) => {
      if (event.detail?.error?.message?.includes('auth') || 
          event.detail?.error?.message?.includes('session')) {
        toast({
          title: "Authentication Error",
          description: "There was an authentication error. Please refresh the page and try again.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('supabase-error', handleNetworkError);
    return () => window.removeEventListener('supabase-error', handleNetworkError);
  }, [toast]);

  return null; // This component doesn't render anything
};
