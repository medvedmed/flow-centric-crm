
import { supabase } from '@/integrations/supabase/client';
import { StaffAvailability } from '../types';

export const availabilityApi = {
  async getStaffAvailability(staffId?: string, date?: string): Promise<StaffAvailability[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('staff_availability')
      .select('*')
      .eq('salon_id', user.id);

    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query.order('date', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(availability => ({
      id: availability.id,
      staffId: availability.staff_id,
      salonId: availability.salon_id,
      date: availability.date,
      startTime: availability.start_time,
      endTime: availability.end_time,
      isAvailable: availability.is_available,
      reason: availability.reason,
      createdAt: availability.created_at,
      updatedAt: availability.updated_at
    })) || [];
  },

  async createStaffAvailability(availability: StaffAvailability): Promise<StaffAvailability> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('staff_availability')
      .insert({
        staff_id: availability.staffId,
        salon_id: user.id,
        date: availability.date,
        start_time: availability.startTime,
        end_time: availability.endTime,
        is_available: availability.isAvailable !== false,
        reason: availability.reason
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      salonId: data.salon_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      isAvailable: data.is_available,
      reason: data.reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateStaffAvailability(id: string, availability: Partial<StaffAvailability>): Promise<StaffAvailability> {
    const { data, error } = await supabase
      .from('staff_availability')
      .update({
        start_time: availability.startTime,
        end_time: availability.endTime,
        is_available: availability.isAvailable,
        reason: availability.reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      salonId: data.salon_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      isAvailable: data.is_available,
      reason: data.reason,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteStaffAvailability(id: string): Promise<void> {
    const { error } = await supabase
      .from('staff_availability')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
