
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

    // Transform database records to TypeScript interface
    const transformedData = data?.map(record => ({
      id: record.id,
      staffId: record.staff_id,
      salonId: record.salon_id,
      date: record.date,
      startTime: record.start_time,
      endTime: record.end_time,
      isAvailable: record.is_available,
      reason: record.reason,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    })) || [];

    return {
      data: transformedData,
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

  // Create staff availability
  createStaffAvailability: async (
    availability: Omit<StaffAvailability, 'id' | 'salonId' | 'createdAt' | 'updatedAt'>
  ): Promise<StaffAvailability> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('staff_availability')
      .insert({
        staff_id: availability.staffId,
        salon_id: user.id,
        date: availability.date,
        start_time: availability.startTime,
        end_time: availability.endTime,
        is_available: availability.isAvailable,
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

  // Update staff availability
  updateStaffAvailability: async (
    id: string,
    availability: Partial<Omit<StaffAvailability, 'id' | 'salonId' | 'createdAt' | 'updatedAt'>>
  ): Promise<StaffAvailability> => {
    const { data, error } = await supabase
      .from('staff_availability')
      .update({
        start_time: availability.startTime,
        end_time: availability.endTime,
        is_available: availability.isAvailable,
        reason: availability.reason
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
    availabilityRecords: Omit<StaffAvailability, 'id' | 'salonId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<StaffAvailability[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const recordsWithSalonId = availabilityRecords.map(record => ({
      staff_id: record.staffId,
      salon_id: user.id,
      date: record.date,
      start_time: record.startTime,
      end_time: record.endTime,
      is_available: record.isAvailable,
      reason: record.reason
    }));

    const { data, error } = await supabase
      .from('staff_availability')
      .insert(recordsWithSalonId)
      .select();

    if (error) throw error;
    
    return (data || []).map(record => ({
      id: record.id,
      staffId: record.staff_id,
      salonId: record.salon_id,
      date: record.date,
      startTime: record.start_time,
      endTime: record.end_time,
      isAvailable: record.is_available,
      reason: record.reason,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }));
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
    
    return (data || []).map(record => ({
      id: record.id,
      staffId: record.staff_id,
      salonId: record.salon_id,
      date: record.date,
      startTime: record.start_time,
      endTime: record.end_time,
      isAvailable: record.is_available,
      reason: record.reason,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }));
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
