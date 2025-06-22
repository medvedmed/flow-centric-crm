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
      .select('*, count(*) OVER() as total_count', { count: 'exact' })
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
      .select('*, count(*) OVER() as total_count', { count: 'exact' })
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
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('staff')
      .select('*')
      .eq('salon_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('name', { ascending: true });
    
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
        efficiency: staff.efficiency,
        rating: staff.rating,
        image_url: staff.imageUrl,
        hourly_rate: staff.hourlyRate,
        commission_rate: staff.commissionRate,
        status: staff.status,
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
