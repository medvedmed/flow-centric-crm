
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types';

export const profileApi = {
  async getProfile(): Promise<Profile | null> {
    console.log('Fetching profile...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Not authenticated');
    }

    console.log('Authenticated user ID:', user.id);

    // First get the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      if (profileError.code === 'PGRST116') return null;
      throw profileError;
    }
    
    // Try to get organization data if available
    let orgData = null;
    if (profile.organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single();
      orgData = org;
    }
    
    console.log('Profile data retrieved:', profile);
    
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      salon_name: orgData?.name || profile.full_name,
      phone: profile.phone,
      role: profile.role,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  },

  async updateProfile(profileUpdate: Partial<Profile & any>): Promise<Profile> {
    console.log('Updating profile with data:', profileUpdate);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Not authenticated');
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (profileUpdate.full_name !== undefined) updateData.full_name = profileUpdate.full_name;
    if (profileUpdate.phone !== undefined) updateData.phone = profileUpdate.phone;

    console.log('Sending update data:', updateData);

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }
    
    console.log('Profile updated successfully:', data);
    
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
};
