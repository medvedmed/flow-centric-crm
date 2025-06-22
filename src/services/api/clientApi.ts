
import { supabase } from '@/integrations/supabase/client';
import { Client, PaginatedResult } from '../types';

export const clientApi = {
  async getClients(searchTerm?: string, page: number = 1, pageSize: number = 50, status?: string): Promise<PaginatedResult<Client>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const offset = (page - 1) * pageSize;
    
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('salon_id', user.id)
      .order('created_at', { ascending: false });

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1);
    
    if (error) throw error;
    
    return {
      data: data?.map(client => ({
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
        updatedAt: client.updated_at,
        clientId: client.client_id,
        clientPassword: client.client_password,
        isPortalEnabled: client.is_portal_enabled
      })) || [],
      count: count || 0,
      hasMore: (count || 0) > offset + pageSize,
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
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
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
      updatedAt: data.updated_at,
      clientId: data.client_id,
      clientPassword: data.client_password,
      isPortalEnabled: data.is_portal_enabled
    };
  },

  async createClient(client: Client): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate client credentials using database functions
    const { data: clientIdData, error: clientIdError } = await supabase
      .rpc('generate_client_id');
    
    if (clientIdError) throw clientIdError;

    const { data: passwordData, error: passwordError } = await supabase
      .rpc('generate_client_password');
    
    if (passwordError) throw passwordError;

    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status || 'New',
        assigned_staff: client.assignedStaff,
        notes: client.notes,
        tags: client.tags,
        total_spent: client.totalSpent || 0,
        visits: client.visits || 0,
        preferred_stylist: client.preferredStylist,
        salon_id: user.id,
        client_id: clientIdData,
        client_password: passwordData,
        is_portal_enabled: false
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
      updatedAt: data.updated_at,
      clientId: data.client_id,
      clientPassword: data.client_password,
      isPortalEnabled: data.is_portal_enabled
    };
  },

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Map client properties to database columns
    if (client.name !== undefined) updateData.name = client.name;
    if (client.email !== undefined) updateData.email = client.email;
    if (client.phone !== undefined) updateData.phone = client.phone;
    if (client.status !== undefined) updateData.status = client.status;
    if (client.assignedStaff !== undefined) updateData.assigned_staff = client.assignedStaff;
    if (client.notes !== undefined) updateData.notes = client.notes;
    if (client.tags !== undefined) updateData.tags = client.tags;
    if (client.totalSpent !== undefined) updateData.total_spent = client.totalSpent;
    if (client.visits !== undefined) updateData.visits = client.visits;
    if (client.preferredStylist !== undefined) updateData.preferred_stylist = client.preferredStylist;
    if (client.isPortalEnabled !== undefined) updateData.is_portal_enabled = client.isPortalEnabled;

    const { data, error } = await supabase
      .from('clients')
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
      updatedAt: data.updated_at,
      clientId: data.client_id,
      clientPassword: data.client_password,
      isPortalEnabled: data.is_portal_enabled
    };
  },

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
