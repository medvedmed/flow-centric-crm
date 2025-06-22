
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
      fullName: data.full_name,
      salonName: data.salon_name,
      phone: data.phone,
      role: data.role as 'salon_owner' | 'staff' | 'admin',
      subscriptionStatus: data.subscription_status as 'trial' | 'active' | 'cancelled' | 'expired',
      subscriptionEndDate: data.subscription_end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.fullName,
        salon_name: profile.salonName,
        phone: profile.phone,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      salonName: data.salon_name,
      phone: data.phone,
      role: data.role as 'salon_owner' | 'staff' | 'admin',
      subscriptionStatus: data.subscription_status as 'trial' | 'active' | 'cancelled' | 'expired',
      subscriptionEndDate: data.subscription_end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};
