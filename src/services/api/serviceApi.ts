
import { supabase } from '@/integrations/supabase/client';
import { Service, PaginatedResult } from '../types';

export const serviceApi = {
  // Get all services for the authenticated salon
  getServices: async (
    searchTerm?: string,
    category?: string,
    isActive?: boolean,
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedResult<Service>> => {
    let query = supabase
      .from('services')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      hasMore: (count || 0) > page * pageSize,
      page,
      pageSize
    };
  },

  // Get a single service by ID
  getService: async (id: string): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new service
  createService: async (service: Omit<Service, 'id' | 'salon_id' | 'created_at' | 'updated_at'>): Promise<Service> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('services')
      .insert({
        ...service,
        salon_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing service
  updateService: async (id: string, service: Partial<Omit<Service, 'id' | 'salon_id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a service
  deleteService: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get service categories
  getCategories: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories.sort();
  },

  // Toggle service popularity
  togglePopular: async (id: string, popular: boolean): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .update({ popular })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Bulk update services
  bulkUpdateServices: async (ids: string[], updates: Partial<Service>): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .in('id', ids)
      .select();

    if (error) throw error;
    return data || [];
  }
};
