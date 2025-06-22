
import { supabase } from '@/integrations/supabase/client';
import { Staff } from '../types';

export const staffApi = {
  async getStaff(status?: string): Promise<Staff[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('staff')
      .select('*')
      .eq('salon_id', user.id);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('name');
    
    if (error) throw error;
    
    return data?.map(staff => ({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      specialties: staff.specialties,
      workingHoursStart: staff.working_hours_start,
      workingHoursEnd: staff.working_hours_end,
      workingDays: staff.working_days,
      breakStart: staff.break_start,
      breakEnd: staff.break_end,
      efficiency: staff.efficiency,
      rating: staff.rating,
      imageUrl: staff.image_url,
      hourlyRate: staff.hourly_rate,
      commissionRate: staff.commission_rate,
      status: staff.status as Staff['status'],
      notes: staff.notes,
      hireDate: staff.hire_date,
      salonId: staff.salon_id,
      createdAt: staff.created_at,
      updatedAt: staff.updated_at
    })) || [];
  },

  async createStaff(staff: Staff): Promise<Staff> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('staff')
      .insert({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        specialties: staff.specialties,
        working_hours_start: staff.workingHoursStart,
        working_hours_end: staff.workingHoursEnd,
        working_days: staff.workingDays,
        break_start: staff.breakStart,
        break_end: staff.breakEnd,
        efficiency: staff.efficiency || 100,
        rating: staff.rating || 5.0,
        image_url: staff.imageUrl,
        hourly_rate: staff.hourlyRate || 0,
        commission_rate: staff.commissionRate || 35,
        status: staff.status || 'active',
        notes: staff.notes,
        hire_date: staff.hireDate,
        salon_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialties: data.specialties,
      workingHoursStart: data.working_hours_start,
      workingHoursEnd: data.working_hours_end,
      workingDays: data.working_days,
      breakStart: data.break_start,
      breakEnd: data.break_end,
      efficiency: data.efficiency,
      rating: data.rating,
      imageUrl: data.image_url,
      hourlyRate: data.hourly_rate,
      commissionRate: data.commission_rate,
      status: data.status as Staff['status'],
      notes: data.notes,
      hireDate: data.hire_date,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .update({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        specialties: staff.specialties,
        working_hours_start: staff.workingHoursStart,
        working_hours_end: staff.workingHoursEnd,
        working_days: staff.workingDays,
        break_start: staff.breakStart,
        break_end: staff.breakEnd,
        efficiency: staff.efficiency,
        rating: staff.rating,
        image_url: staff.imageUrl,
        hourly_rate: staff.hourlyRate,
        commission_rate: staff.commissionRate,
        status: staff.status,
        notes: staff.notes,
        hire_date: staff.hireDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialties: data.specialties,
      workingHoursStart: data.working_hours_start,
      workingHoursEnd: data.working_hours_end,
      workingDays: data.working_days,
      breakStart: data.break_start,
      breakEnd: data.break_end,
      efficiency: data.efficiency,
      rating: data.rating,
      imageUrl: data.image_url,
      hourlyRate: data.hourly_rate,
      commissionRate: data.commission_rate,
      status: data.status as Staff['status'],
      notes: data.notes,
      hireDate: data.hire_date,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteStaff(id: string): Promise<void> {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async createStaffWithRole(staff: Staff, role: 'staff' | 'receptionist' = 'staff'): Promise<Staff> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // First create the staff member
    const createdStaff = await this.createStaff(staff);

    // Then assign role if staff has email (can be invited as user)
    if (staff.email) {
      // This would typically involve sending an invitation
      // For now, we'll just create the staff record
      console.log(`Staff ${createdStaff.name} created with role: ${role}`);
    }

    return createdStaff;
  }
};
