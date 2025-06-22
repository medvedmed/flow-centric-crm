
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types';

export const profileApi = {
  async getProfile(): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    
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
      updated_at: data.updated_at
    };
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        salon_name: profile.salon_name,
        phone: profile.phone,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
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
      updated_at: data.updated_at
    };
  }
};
