
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/services/types';

export const createClient = async (client: Client): Promise<Client> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('clients')
    .insert({
      full_name: client.name,
      email: client.email,
      phone: client.phone || '',
      status: client.status || 'active',
      notes: client.notes,
      organization_id: user.id,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.full_name,
    email: data.email || '',
    phone: data.phone,
    status: data.status as Client['status'],
    notes: data.notes,
    totalSpent: data.total_spent || 0,
    visits: data.total_visits || 0,
    lastVisit: data.last_visit_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (client.name !== undefined) updateData.full_name = client.name;
  if (client.email !== undefined) updateData.email = client.email;
  if (client.phone !== undefined) updateData.phone = client.phone;
  if (client.status !== undefined) updateData.status = client.status;
  if (client.notes !== undefined) updateData.notes = client.notes;

  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.full_name,
    email: data.email || '',
    phone: data.phone,
    status: data.status as Client['status'],
    notes: data.notes,
    totalSpent: data.total_spent || 0,
    visits: data.total_visits || 0,
    lastVisit: data.last_visit_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
