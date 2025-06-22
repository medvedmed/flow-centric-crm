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
  efficiency?: number;
  rating?: number;
  imageUrl?: string;
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

// Client API functions
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
      role: data.role,
      subscriptionStatus: data.subscription_status,
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
      role: data.role,
      subscriptionStatus: data.subscription_status,
      subscriptionEndDate: data.subscription_end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // Client functions
  async getClients(searchTerm?: string): Promise<Client[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('clients')
      .select('*')
      .eq('salon_id', user.id);
    
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(client => ({
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

  // Appointment functions with salon isolation
  async getAppointments(clientId?: string, staffId?: string): Promise<Appointment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

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
    
    const { data, error } = await query.order('date', { ascending: true }).order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(appointment => ({
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

  // Staff functions with salon isolation
  async getStaff(): Promise<Staff[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('salon_id', user.id)
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return data?.map(staff => ({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      specialties: staff.specialties,
      workingHoursStart: staff.working_hours_start,
      workingHoursEnd: staff.working_hours_end,
      efficiency: staff.efficiency,
      rating: staff.rating,
      imageUrl: staff.image_url,
      salonId: staff.salon_id,
      createdAt: staff.created_at,
      updatedAt: staff.updated_at
    })) || [];
  }
};
