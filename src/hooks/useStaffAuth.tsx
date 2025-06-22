
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface StaffSession {
  staffId: string;
  staffName: string;
  staffEmail: string;
  salonId: string;
  loginTime: string;
}

interface StaffAuthContextType {
  staffSession: StaffSession | null;
  isStaff: boolean;
  isLoading: boolean;
  signOutStaff: () => void;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [staffSession, setStaffSession] = useState<StaffSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Check for staff session in localStorage
    const storedStaffSession = localStorage.getItem('staff_session');
    if (storedStaffSession) {
      try {
        const session = JSON.parse(storedStaffSession);
        setStaffSession(session);
      } catch (error) {
        console.error('Error parsing staff session:', error);
        localStorage.removeItem('staff_session');
      }
    }
    setIsLoading(false);
  }, []);

  // Clear staff session if regular user logs in
  useEffect(() => {
    if (user && staffSession) {
      localStorage.removeItem('staff_session');
      setStaffSession(null);
    }
  }, [user, staffSession]);

  const signOutStaff = () => {
    localStorage.removeItem('staff_session');
    setStaffSession(null);
  };

  const isStaff = !!staffSession && !user;

  return (
    <StaffAuthContext.Provider value={{ 
      staffSession, 
      isStaff, 
      isLoading,
      signOutStaff 
    }}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};
