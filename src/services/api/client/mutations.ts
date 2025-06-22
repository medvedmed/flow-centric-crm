
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/services/types';
import { transformDatabaseClient, prepareClientUpdate, DatabaseClient } from './types';

export const createClient = async (client: Client): Promise<Client> => {
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
  
  return transformDatabaseClient(data as DatabaseClient);
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const updateData = prepareClientUpdate(client);

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return transformDatabaseClient(data as DatabaseClient);
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
