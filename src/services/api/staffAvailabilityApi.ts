
import { supabase } from '@/integrations/supabase/client';
import { StaffAvailability, PaginatedResult } from '../types';

export const staffAvailabilityApi = {
  // Get staff availability with proper filtering and pagination
  getStaffAvailability: async (
    staffId?: string,
    date?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResult<StaffAvailability>> => {
    let query = supabase
      .from('staff_availability')
      .select('*', { count: 'exact' })
      .order('date', { ascending: true });

    // Apply filters
    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    if (date) {
      query = query.eq('date', date);
    } else if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    } else if (endDate) {
      query = query.lte('date', endDate);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      hasMore: (count || 0) > page * pageSize,
      page,
      pageSize
    };
  },

  // Get single availability record
  getAvailabilityById: async (id: string): Promise<StaffAvailability> => {
    const { data, error } = await supabase
      .from('staff_availability')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create staff availability
  createStaffAvailability: async (
    availability: Omit<StaffAvailability, 'id' | 'salon_id' | 'created_at' | 'updated_at'>
  ): Promise<StaffAvailability> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('staff_availability')
      .insert({
        ...availability,
        salon_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update staff availability
  updateStaffAvailability: async (
    id: string,
    availability: Partial<Omit<StaffAvailability, 'id' | 'salon_id' | 'created_at' | 'updated_at'>>
  ): Promise<StaffAvailability> => {
    const { data, error } = await supabase
      .from('staff_availability')
      .update(availability)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete staff availability
  deleteStaffAvailability: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('staff_availability')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Bulk create availability records
  bulkCreateAvailability: async (
    availabilityRecords: Omit<StaffAvailability, 'id' | 'salon_id' | 'created_at' | 'updated_at'>[]
  ): Promise<StaffAvailability[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const recordsWithSalonId = availabilityRecords.map(record => ({
      ...record,
      salon_id: user.id
    }));

    const { data, error } = await supabase
      .from('staff_availability')
      .insert(recordsWithSalonId)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Get availability for date range
  getAvailabilityRange: async (
    staffId: string,
    startDate: string,
    endDate: string
  ): Promise<StaffAvailability[]> => {
    const { data, error } = await supabase
      .from('staff_availability')
      .select('*')
      .eq('staff_id', staffId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Check if staff is available on a specific date and time
  checkAvailability: async (
    staffId: string,
    date: string,
    startTime?: string,
    endTime?: string
  ): Promise<boolean> => {
    let query = supabase
      .from('staff_availability')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date);

    const { data, error } = await query;

    if (error) throw error;

    // If no records found, assume available (default availability)
    if (!data || data.length === 0) return true;

    // Check if any record indicates unavailability
    const unavailableRecords = data.filter(record => !record.is_available);
    
    if (unavailableRecords.length === 0) return true;

    // If specific time range is provided, check for time conflicts
    if (startTime && endTime) {
      return !unavailableRecords.some(record => {
        if (!record.start_time || !record.end_time) return false;
        
        const recordStart = record.start_time;
        const recordEnd = record.end_time;
        
        // Check for time overlap
        return (startTime < recordEnd && endTime > recordStart);
      });
    }

    return false;
  }
};
