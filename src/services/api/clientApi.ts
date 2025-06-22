
import { supabase } from '@/integrations/supabase/client';
import { Client, PaginatedResult } from '../types';

export const clientApi = {
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
  }
};
