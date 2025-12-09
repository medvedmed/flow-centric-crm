
import { Client } from '@/services/types';

// This interface matches the actual database schema for clients table
export interface DatabaseClient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  status: string | null;
  notes: string | null;
  total_spent: number | null;
  total_visits: number | null;
  last_visit_date: string | null;
  organization_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  preferences: any;
}

export const transformDatabaseClient = (dbClient: DatabaseClient): Client => ({
  id: dbClient.id,
  name: dbClient.full_name,
  email: dbClient.email || '',
  phone: dbClient.phone,
  status: (dbClient.status as Client['status']) || 'active',
  notes: dbClient.notes,
  totalSpent: dbClient.total_spent || 0,
  visits: dbClient.total_visits || 0,
  lastVisit: dbClient.last_visit_date,
  createdAt: dbClient.created_at || undefined,
  updatedAt: dbClient.updated_at || undefined,
});

export const prepareClientUpdate = (client: Partial<Client>) => {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  if (client.name !== undefined) updateData.full_name = client.name;
  if (client.email !== undefined) updateData.email = client.email;
  if (client.phone !== undefined) updateData.phone = client.phone;
  if (client.status !== undefined) updateData.status = client.status;
  if (client.notes !== undefined) updateData.notes = client.notes;

  return updateData;
};
