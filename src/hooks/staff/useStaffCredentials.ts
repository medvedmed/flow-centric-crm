
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStaffCredentials = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMissingCredentials = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, let's manually trigger credential generation for staff without them
      const { data: staffWithoutCredentials } = await supabase
        .from('staff')
        .select('id, name')
        .eq('salon_id', user.id)
        .or('staff_login_id.is.null,staff_login_password.is.null');

      if (staffWithoutCredentials && staffWithoutCredentials.length > 0) {
        console.log(`Found ${staffWithoutCredentials.length} staff members without credentials`);
        
        // For each staff member without credentials, manually generate them
        for (const staff of staffWithoutCredentials) {
          // Generate login ID
          const loginIdResponse = await supabase.rpc('generate_staff_login_id');
          const loginPasswordResponse = await supabase.rpc('generate_staff_login_password');

          if (loginIdResponse.data && loginPasswordResponse.data) {
            await supabase
              .from('staff')
              .update({
                staff_login_id: loginIdResponse.data,
                staff_login_password: loginPasswordResponse.data,
                updated_at: new Date().toISOString()
              })
              .eq('id', staff.id);
            
            console.log(`Generated credentials for ${staff.name}`);
          }
        }

        return staffWithoutCredentials.length;
      }

      return 0;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      if (count > 0) {
        toast({
          title: "Success",
          description: `Generated credentials for ${count} staff member(s)`,
        });
      } else {
        toast({
          title: "Info",
          description: "All staff members already have credentials",
        });
      }
    },
    onError: (error) => {
      console.error('Error generating credentials:', error);
      toast({
        title: "Error",
        description: "Failed to generate missing credentials",
        variant: "destructive",
      });
    },
  });

  return {
    generateMissingCredentials
  };
};
