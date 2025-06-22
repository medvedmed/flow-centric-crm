
import { supabase } from '@/integrations/supabase/client';
import { TimeOffRequest } from '../types';

export const timeOffApi = {
  async getTimeOffRequests(staffId?: string, status?: string): Promise<TimeOffRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('time_off_requests')
      .select('*')
      .eq('salon_id', user.id);

    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('requested_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(request => ({
      id: request.id,
      staffId: request.staff_id,
      salonId: request.salon_id,
      startDate: request.start_date,
      endDate: request.end_date,
      reason: request.reason,
      status: request.status as TimeOffRequest['status'],
      requestedAt: request.requested_at,
      reviewedAt: request.reviewed_at,
      reviewedBy: request.reviewed_by,
      notes: request.notes,
      createdAt: request.created_at,
      updatedAt: request.updated_at
    })) || [];
  },

  async createTimeOffRequest(request: TimeOffRequest): Promise<TimeOffRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('time_off_requests')
      .insert({
        staff_id: request.staffId,
        salon_id: user.id,
        start_date: request.startDate,
        end_date: request.endDate,
        reason: request.reason,
        status: request.status || 'pending',
        notes: request.notes
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      salonId: data.salon_id,
      startDate: data.start_date,
      endDate: data.end_date,
      reason: data.reason,
      status: data.status as TimeOffRequest['status'],
      requestedAt: data.requested_at,
      reviewedAt: data.reviewed_at,
      reviewedBy: data.reviewed_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateTimeOffRequest(id: string, request: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (request.status) {
      updates.status = request.status;
      if (request.status !== 'pending') {
        updates.reviewed_at = new Date().toISOString();
        updates.reviewed_by = user.id;
      }
    }

    if (request.notes !== undefined) updates.notes = request.notes;
    if (request.reason !== undefined) updates.reason = request.reason;
    if (request.startDate) updates.start_date = request.startDate;
    if (request.endDate) updates.end_date = request.endDate;

    const { data, error } = await supabase
      .from('time_off_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      staffId: data.staff_id,
      salonId: data.salon_id,
      startDate: data.start_date,
      endDate: data.end_date,
      reason: data.reason,
      status: data.status as TimeOffRequest['status'],
      requestedAt: data.requested_at,
      reviewedAt: data.reviewed_at,
      reviewedBy: data.reviewed_by,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteTimeOffRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('time_off_requests')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
