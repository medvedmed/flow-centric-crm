
import { Client } from '@/services/types';

export interface DatabaseClient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  assigned_staff: string | null;
  notes: string | null;
  tags: string | null;
  total_spent: number | null;
  visits: number | null;
  preferred_stylist: string | null;
  last_visit: string | null;
  salon_id: string;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  client_password: string | null;
  is_portal_enabled: boolean | null;
}

export const transformDatabaseClient = (dbClient: DatabaseClient): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  email: dbClient.email,
  phone: dbClient.phone,
  status: dbClient.status as Client['status'],
  assignedStaff: dbClient.assigned_staff,
  notes: dbClient.notes,
  tags: dbClient.tags,
  totalSpent: dbClient.total_spent,
  visits: dbClient.visits,
  preferredStylist: dbClient.preferred_stylist,
  lastVisit: dbClient.last_visit,
  salonId: dbClient.salon_id,
  createdAt: dbClient.created_at,
  updatedAt: dbClient.updated_at,
  clientId: dbClient.client_id,
  clientPassword: dbClient.client_password,
  isPortalEnabled: dbClient.is_portal_enabled
});

export const prepareClientUpdate = (client: Partial<Client>) => {
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

  return updateData;
};
