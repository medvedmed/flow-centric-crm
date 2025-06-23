
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

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Profile fetch error:', error);
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
    console.log('Profile data retrieved:', data);
    
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      salon_name: data.salon_name,
      phone: data.phone,
      role: data.role as 'salon_owner' | 'staff' | 'admin',
      subscription_status: data.subscription_status as 'trial' | 'active' | 'cancelled' | 'expired',
      subscription_end_date: data.subscription_end_date,
      created_at: data.created_at,
      updated_at: data.updated_at,
      address: data.address,
      description: data.description,
      opening_hours: data.opening_hours,
      closing_hours: data.closing_hours,
      working_days: data.working_days,
      website: data.website,
      social_media: data.social_media
    } as any;
  },

  async updateProfile(profile: Partial<Profile & any>): Promise<Profile> {
    console.log('Updating profile with data:', profile);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Not authenticated');
    }

    const updateData = {
      ...(profile.full_name !== undefined && { full_name: profile.full_name }),
      ...(profile.salon_name !== undefined && { salon_name: profile.salon_name }),
      ...(profile.phone !== undefined && { phone: profile.phone }),
      ...(profile.address !== undefined && { address: profile.address }),
      ...(profile.description !== undefined && { description: profile.description }),
      ...(profile.opening_hours !== undefined && { opening_hours: profile.opening_hours }),
      ...(profile.closing_hours !== undefined && { closing_hours: profile.closing_hours }),
      ...(profile.working_days !== undefined && { working_days: profile.working_days }),
      ...(profile.website !== undefined && { website: profile.website }),
      ...(profile.social_media !== undefined && { social_media: profile.social_media }),
      updated_at: new Date().toISOString()
    };

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
      salon_name: data.salon_name,
      phone: data.phone,
      role: data.role as 'salon_owner' | 'staff' | 'admin',
      subscription_status: data.subscription_status as 'trial' | 'active' | 'cancelled' | 'expired',
      subscription_end_date: data.subscription_end_date,
      created_at: data.created_at,
      updated_at: data.updated_at,
      address: data.address,
      description: data.description,
      opening_hours: data.opening_hours,
      closing_hours: data.closing_hours,
      working_days: data.working_days,
      website: data.website,
      social_media: data.social_media
    } as any;
  }
};
