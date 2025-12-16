import { supabase } from '@/integrations/supabase/client';

// Helper to get user's organization ID from their profile
export const getUserOrgId = async (): Promise<string> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Authentication required. Please log in again.');
  }

  // Get the organization_id from the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    throw new Error('Failed to fetch user profile');
  }

  // Use organization_id if available, otherwise fall back to user.id
  const orgId = profile?.organization_id || user.id;
  
  return orgId;
};

// Helper to get both user ID and org ID
export const getUserAndOrgId = async (): Promise<{ userId: string; orgId: string }> => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Authentication required. Please log in again.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  return {
    userId: user.id,
    orgId: profile?.organization_id || user.id
  };
};
