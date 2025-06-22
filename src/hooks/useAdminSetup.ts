
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { permissionApi } from '@/services/permissionApi';

export const useAdminSetup = () => {
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);

  useEffect(() => {
    checkAndSetupAdmin();
  }, []);

  const checkAndSetupAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsCheckingAdmin(false);
        return;
      }

      // Check if user already has a role
      const existingRole = await permissionApi.getCurrentUserRole();
      
      if (!existingRole) {
        // Check if this is the first user in the system
        const { data: existingUsers } = await supabase
          .from('user_roles')
          .select('id')
          .limit(1);

        if (!existingUsers || existingUsers.length === 0) {
          // First user - automatically make them salon owner
          await permissionApi.assignUserRole(user.id, 'salon_owner');
          console.log('First user assigned as salon owner');
        } else {
          // Not first user - needs manual role assignment
          setNeedsAdminSetup(true);
        }
      }
    } catch (error) {
      console.error('Error setting up admin:', error);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  return {
    isCheckingAdmin,
    needsAdminSetup,
    setupAdmin: checkAndSetupAdmin
  };
};
