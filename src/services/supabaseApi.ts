import { supabase } from '@/integrations/supabase/client';

// Define interfaces that match our Supabase schema exactly
export interface Client {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  status: 'New' | 'Regular' | 'VIP' | 'Active' | 'Inactive';
  assignedStaff?: string;
  notes?: string;
  tags?: string;
  totalSpent?: number;
  visits?: number;
  preferredStylist?: string;
  lastVisit?: string;
  salonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Staff {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: string[];
  breakStart?: string;
  breakEnd?: string;
  efficiency?: number;
  rating?: number;
  imageUrl?: string;
  hourlyRate?: number;
  commissionRate?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  notes?: string;
  hireDate?: string;
  salonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id?: string;
  clientId?: string;
  staffId: string;
  clientName: string;
  clientPhone?: string;
  service: string;
  startTime: string;
  endTime: string;
  date: string;
  price?: number;
  duration?: number;
  status?: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  salonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  salonName?: string;
  phone?: string;
  role: 'salon_owner' | 'staff' | 'admin';
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired';
  subscriptionEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeOffRequest {
  id?: string;
  staffId: string;
  salonId?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffAvailability {
  id?: string;
  staffId: string;
  salonId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

// Client API functions with optimized queries
export const supabaseApi = {
  // Profile functions
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
  },

  // Optimized client functions with pagination and full-text search
  async getClients(
    searchTerm?: string,
    page: number = 1,
    pageSize: number = 50,
    status?: string
  ): Promise<PaginatedResult<Client>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('clients')
      .select('*')
      .eq('salon_id', user.id);
    
    // Use full-text search when available, fallback to ILIKE
    if (searchTerm) {
      query = query.or(`
        to_tsvector('english', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '')) @@ plainto_tsquery('english', '${searchTerm}'),
        name.ilike.%${searchTerm}%,
        email.ilike.%${searchTerm}%,
        phone.ilike.%${searchTerm}%
      `);
    }

    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    const clients = data?.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status as Client['status'],
      assignedStaff: client.assigned_staff,
      notes: client.notes,
      tags: client.tags,
      totalSpent: client.total_spent,
      visits: client.visits,
      preferredStylist: client.preferred_stylist,
      lastVisit: client.last_visit,
      salonId: client.salon_id,
      createdAt: client.created_at,
      updatedAt: client.updated_at
    })) || [];

    return {
      data: clients,
      count: count || 0,
      hasMore: (count || 0) > page * pageSize,
      page,
      pageSize
    };
  },

  async getClient(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: data.status as Client['status'],
      assignedStaff: data.assigned_staff,
      notes: data.notes,
      tags: data.tags,
      totalSpent: data.total_spent,
      visits: data.visits,
      preferredStylist: data.preferred_stylist,
      lastVisit: data.last_visit,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async createClient(client: Client): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        assigned_staff: client.assignedStaff,
        notes: client.notes,
        tags: client.tags,
        total_spent: client.totalSpent,
        visits: client.visits,
        preferred_stylist: client.preferredStylist,
        last_visit: client.lastVisit,
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
      status: data.status as Client['status'],
      assignedStaff: data.assigned_staff,
      notes: data.notes,
      tags: data.tags,
      totalSpent: data.total_spent,
      visits: data.visits,
      preferredStylist: data.preferred_stylist,
      lastVisit: data.last_visit,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        assigned_staff: client.assignedStaff,
        notes: client.notes,
        tags: client.tags,
        total_spent: client.totalSpent,
        visits: client.visits,
        preferred_stylist: client.preferredStylist,
        last_visit: client.lastVisit,
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
      status: data.status as Client['status'],
      assignedStaff: data.assigned_staff,
      notes: data.notes,
      tags: data.tags,
      totalSpent: data.total_spent,
      visits: data.visits,
      preferredStylist: data.preferred_stylist,
      lastVisit: data.last_visit,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Optimized appointment functions with date-based queries
  async getAppointments(
    clientId?: string,
    staffId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<PaginatedResult<Appointment>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', user.id);
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    if (staffId) {
      query = query.eq('staff_id', staffId);
    }

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (startDate) {
      query = query.gte('date', startDate);
    } else if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error, count } = await query
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .range(from, to);
    
    if (error) throw error;
    
    const appointments = data?.map(appointment => ({
      id: appointment.id,
      clientId: appointment.client_id,
      staffId: appointment.staff_id,
      clientName: appointment.client_name,
      clientPhone: appointment.client_phone,
      service: appointment.service,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      date: appointment.date,
      price: appointment.price,
      duration: appointment.duration,
      status: appointment.status as Appointment['status'],
      notes: appointment.notes,
      salonId: appointment.salon_id,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at
    })) || [];

    return {
      data: appointments,
      count: count || 0,
      hasMore: (count || 0) > page * pageSize,
      page,
      pageSize
    };
  },

  async createAppointment(appointment: Appointment): Promise<Appointment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: appointment.clientId,
        staff_id: appointment.staffId,
        client_name: appointment.clientName,
        client_phone: appointment.clientPhone,
        service: appointment.service,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        date: appointment.date,
        price: appointment.price,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        salon_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      staffId: data.staff_id,
      clientName: data.client_name,
      clientPhone: data.client_phone,
      service: data.service,
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.date,
      price: data.price,
      duration: data.duration,
      status: data.status as Appointment['status'],
      notes: data.notes,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        client_id: appointment.clientId,
        staff_id: appointment.staffId,
        client_name: appointment.clientName,
        client_phone: appointment.clientPhone,
        service: appointment.service,
        start_time: appointment.startTime,
        end_time: appointment.endTime,
        date: appointment.date,
        price: appointment.price,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      clientId: data.client_id,
      staffId: data.staff_id,
      clientName: data.client_name,
      clientPhone: data.client_phone,
      service: data.service,
      startTime: data.start_time,
      endTime: data.end_time,
      date: data.date,
      price: data.price,
      duration: data.duration,
      status: data.status as Appointment['status'],
      notes: data.notes,
      salonId: data.salon_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Optimized staff functions
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

  // New Time-off Request functions
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
  },

  // Staff Availability functions
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
  },

  // Analytics and reporting functions
  async getClientStats(): Promise<{
    totalClients: number;
    newClients: number;
    activeClients: number;
    vipClients: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('clients')
      .select('status')
      .eq('salon_id', user.id);
    
    if (error) throw error;

    const stats = {
      totalClients: data?.length || 0,
      newClients: data?.filter(c => c.status === 'New').length || 0,
      activeClients: data?.filter(c => c.status === 'Active').length || 0,
      vipClients: data?.filter(c => c.status === 'VIP').length || 0,
    };

    return stats;
  }
};
