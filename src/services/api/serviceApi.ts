
import { supabase } from '@/integrations/supabase/client';
import { Service, PaginatedResult } from '../types';

// Map database response to Service type
const mapDbService = (data: any): Service => ({
  id: data.id,
  salon_id: data.organization_id || data.salon_id || '',
  name: data.name,
  category: data.category || '',
  duration: data.duration,
  price: data.price,
  description: data.description,
  is_active: data.is_active,
  popular: false,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const serviceApi = {
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

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data || []).map(mapDbService),
      count: count || 0,
      hasMore: (count || 0) > page * pageSize,
      page,
      pageSize
    };
  },

  getService: async (id: string): Promise<Service> => {
    const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
    if (error) throw error;
    return mapDbService(data);
  },

  createService: async (service: Omit<Service, 'id' | 'salon_id' | 'created_at' | 'updated_at'>): Promise<Service> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase.from('services').insert({ ...service, organization_id: user.id }).select().single();
    if (error) throw error;
    return mapDbService(data);
  },

  updateService: async (id: string, service: Partial<Omit<Service, 'id' | 'salon_id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
    const { data, error } = await supabase.from('services').update(service).eq('id', id).select().single();
    if (error) throw error;
    return mapDbService(data);
  },

  deleteService: async (id: string): Promise<void> => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  getCategories: async (): Promise<string[]> => {
    const { data, error } = await supabase.from('services').select('category').eq('is_active', true);
    if (error) throw error;
    return [...new Set(data?.map(item => item.category).filter(Boolean) || [])].sort();
  },

  togglePopular: async (id: string, popular: boolean): Promise<Service> => {
    const { data, error } = await supabase.from('services').update({ is_active: popular }).eq('id', id).select().single();
    if (error) throw error;
    return mapDbService(data);
  },

  bulkUpdateServices: async (ids: string[], updates: Partial<Service>): Promise<Service[]> => {
    const { data, error } = await supabase.from('services').update(updates).in('id', ids).select();
    if (error) throw error;
    return (data || []).map(mapDbService);
  }
};
