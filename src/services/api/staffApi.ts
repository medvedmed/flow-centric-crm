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
      staffCode: staff.staff_code,
      staffLoginId: staff.staff_login_id,
      staffLoginPassword: staff.staff_login_password,
      createdAt: staff.created_at,
      updatedAt: staff.updated_at
    })) || [];
  },

  async createStaff(staff: Staff): Promise<Staff> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Helper function to format time properly
    const formatTime = (timeString?: string) => {
      if (!timeString) return null;
      // If already in HH:MM:SS format, return as is
      if (timeString.split(':').length === 3) return timeString;
      // If in HH:MM format, add seconds
      return `${timeString}:00`;
    };

    // Ensure proper data mapping with formatted times
    const staffData = {
      name: staff.name,
      email: staff.email,
      phone: staff.phone || null,
      specialties: staff.specialties || [],
      working_hours_start: formatTime(staff.workingHoursStart) || '09:00:00',
      working_hours_end: formatTime(staff.workingHoursEnd) || '17:00:00',
      working_days: staff.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      break_start: formatTime(staff.breakStart) || '12:00:00',
      break_end: formatTime(staff.breakEnd) || '13:00:00',
      efficiency: staff.efficiency || 100,
      rating: staff.rating || 5.0,
      image_url: staff.imageUrl || null,
      hourly_rate: staff.hourlyRate || 0,
      commission_rate: staff.commissionRate || 35,
      status: staff.status || 'active',
      notes: staff.notes || null,
      hire_date: staff.hireDate || new Date().toISOString().split('T')[0],
      salon_id: user.id
    };

    console.log('Creating staff with formatted data:', staffData);

    const { data, error } = await supabase
      .from('staff')
      .insert(staffData)
      .select()
      .single();
    
    if (error) {
      console.error('Staff creation error details:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('break_end') || error.message.includes('breakEnd')) {
        errorMessage = 'Invalid break end time. Please ensure the time is in correct format.';
      } else if (error.message.includes('break_start') || error.message.includes('breakStart')) {
        errorMessage = 'Invalid break start time. Please ensure the time is in correct format.';
      } else if (error.message.includes('working_hours')) {
        errorMessage = 'Invalid working hours. Please ensure times are in correct format.';
      } else if (error.code === '23505') {
        errorMessage = 'A staff member with this email already exists.';
      }
      
      throw new Error(errorMessage);
    }
    
    console.log('Staff created successfully:', data);
    
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
      staffCode: data.staff_code,
      staffLoginId: data.staff_login_id,
      staffLoginPassword: data.staff_login_password,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
    const updateData: any = {};
    
    // Map camelCase to snake_case for database
    if (staff.name !== undefined) updateData.name = staff.name;
    if (staff.email !== undefined) updateData.email = staff.email;
    if (staff.phone !== undefined) updateData.phone = staff.phone;
    if (staff.specialties !== undefined) updateData.specialties = staff.specialties;
    if (staff.workingHoursStart !== undefined) updateData.working_hours_start = staff.workingHoursStart;
    if (staff.workingHoursEnd !== undefined) updateData.working_hours_end = staff.workingHoursEnd;
    if (staff.workingDays !== undefined) updateData.working_days = staff.workingDays;
    if (staff.breakStart !== undefined) updateData.break_start = staff.breakStart;
    if (staff.breakEnd !== undefined) updateData.break_end = staff.breakEnd;
    if (staff.efficiency !== undefined) updateData.efficiency = staff.efficiency;
    if (staff.rating !== undefined) updateData.rating = staff.rating;
    if (staff.imageUrl !== undefined) updateData.image_url = staff.imageUrl;
    if (staff.hourlyRate !== undefined) updateData.hourly_rate = staff.hourlyRate;
    if (staff.commissionRate !== undefined) updateData.commission_rate = staff.commissionRate;
    if (staff.status !== undefined) updateData.status = staff.status;
    if (staff.notes !== undefined) updateData.notes = staff.notes;
    if (staff.hireDate !== undefined) updateData.hire_date = staff.hireDate;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('staff')
      .update(updateData)
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
      staffCode: data.staff_code,
      staffLoginId: data.staff_login_id,
      staffLoginPassword: data.staff_login_password,
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

  async generateMissingCredentials(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get staff without credentials
    const { data: staffWithoutCredentials, error } = await supabase
      .from('staff')
      .select('id')
      .eq('salon_id', user.id)
      .or('staff_login_id.is.null,staff_login_password.is.null');

    if (error) throw error;

    if (staffWithoutCredentials && staffWithoutCredentials.length > 0) {
      // Update each staff member to trigger credential generation
      for (const staff of staffWithoutCredentials) {
        await supabase
          .from('staff')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', staff.id);
      }
    }
  },

  async createStaffWithRole(staff: Staff, role: 'staff' | 'receptionist' = 'staff'): Promise<Staff> {
    const createdStaff = await this.createStaff(staff);
    console.log(`Staff ${createdStaff.name} created with role: ${role}`);
    return createdStaff;
  }
};
