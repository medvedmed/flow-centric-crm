
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StaffAuthContextType {
  isStaff: boolean;
  isLoading: boolean;
  staffData: any;
  clearStaffSession: () => void;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);

  useEffect(() => {
    // Check for existing staff session
    const checkStaffSession = () => {
      const staffSession = localStorage.getItem('staff_session');
      if (staffSession) {
        try {
          const parsedSession = JSON.parse(staffSession);
          setStaffData(parsedSession);
          setIsStaff(true);
        } catch (error) {
          console.error('Error parsing staff session:', error);
          localStorage.removeItem('staff_session');
        }
      }
      setIsLoading(false);
    };

    checkStaffSession();
  }, []);

  const clearStaffSession = () => {
    localStorage.removeItem('staff_session');
    setIsStaff(false);
    setStaffData(null);
  };

  return (
    <StaffAuthContext.Provider value={{ 
      isStaff, 
      isLoading, 
      staffData, 
      clearStaffSession 
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
