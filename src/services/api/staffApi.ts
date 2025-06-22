
import { supabase } from '@/integrations/supabase/client';
import { Staff } from '../types';

export const staffApi = {
  async getStaff(status?: string): Promise<Staff[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('getStaff: No authenticated user found');
      throw new Error('Not authenticated');
    }

    console.log('getStaff: Authenticated user ID:', user.id);

    let query = supabase
      .from('staff')
      .select('*')
      .eq('salon_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) {
      console.error('getStaff: Database error:', error);
      throw error;
    }
    
    console.log('getStaff: Retrieved staff count:', data?.length || 0);
    
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
    console.log('=== createStaff Debug Info ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('createStaff: No authenticated user found');
      throw new Error('Not authenticated');
    }

    console.log('createStaff: Authenticated user ID:', user.id);
    console.log('createStaff: Staff data received:', staff);

    // Ensure salon_id is set to the authenticated user's ID
    const staffData = {
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
      salon_id: user.id // Explicitly set to authenticated user's ID
    };

    console.log('createStaff: Final data to insert:', staffData);

    const { data, error } = await supabase
      .from('staff')
      .insert(staffData)
      .select()
      .single();
    
    if (error) {
      console.error('createStaff: Database error:', error);
      console.error('createStaff: Error code:', error.code);
      console.error('createStaff: Error message:', error.message);
      console.error('createStaff: Error details:', error.details);
      console.error('createStaff: Error hint:', error.hint);
      
      // Provide more specific error messages
      if (error.code === '42501' || error.message.includes('row-level security')) {
        throw new Error('Permission denied: Unable to create staff member. Please ensure you are properly authenticated.');
      }
      
      throw error;
    }
    
    console.log('createStaff: Successfully created staff:', data);
    
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
    console.log('=== createStaffWithRole Debug Info ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('createStaffWithRole: No authenticated user found');
      throw new Error('Not authenticated');
    }

    console.log('createStaffWithRole: Authenticated user ID:', user.id);
    console.log('createStaffWithRole: Staff data received:', staff);
    console.log('createStaffWithRole: Role to assign:', role);

    // First create the staff member
    const createdStaff = await this.createStaff(staff);
    
    // If staff has an email, we'll need to handle role assignment when they sign up
    // For now, we just create the staff record
    console.log('createStaffWithRole: Successfully created staff:', createdStaff);
    
    return createdStaff;
  }
};
