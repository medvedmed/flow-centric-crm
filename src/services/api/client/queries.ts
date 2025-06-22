
import { supabase } from '@/integrations/supabase/client';
import { Client, PaginatedResult } from '@/services/types';
import { transformDatabaseClient, DatabaseClient } from './types';

export const getClients = async (
  searchTerm?: string, 
  page: number = 1, 
  pageSize: number = 50, 
  status?: string
): Promise<PaginatedResult<Client>> => {
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
    data: data?.map((client: DatabaseClient) => transformDatabaseClient(client)) || [],
    count: count || 0,
    hasMore: (count || 0) > offset + pageSize,
    page,
    pageSize
  };
};

export const getClient = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return transformDatabaseClient(data as DatabaseClient);
};
