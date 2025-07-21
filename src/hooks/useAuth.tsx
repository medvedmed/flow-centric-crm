
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing session:', error);
        setSession(null);
        setUser(null);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      console.log('Session refreshed:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        sessionValid: !!session?.access_token 
      });
    } catch (error) {
      console.error('Error in refreshSession:', error);
      setSession(null);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
          
          // Log auth state for debugging
          console.log('Initial auth state:', {
            hasSession: !!session,
            userId: session?.user?.id,
            sessionValid: !!session?.access_token
          });
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        if (mounted) {
          // Clear any staff session when regular user logs in
          if (session?.user) {
            localStorage.removeItem('staff_session');
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);

          // Additional validation for expired sessions
          if (event === 'TOKEN_REFRESHED' && !session) {
            console.warn('Token refresh failed, user may need to log in again');
          }
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Also clear any staff session
      localStorage.removeItem('staff_session');
      setSession(null);
      setUser(null);
      // Redirect to landing page after logout
      window.location.href = '/landing';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAuthenticated = !!session && !!user && !!session.access_token;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signOut, 
      isAuthenticated,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
