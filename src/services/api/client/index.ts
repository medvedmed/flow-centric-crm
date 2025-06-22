
import { getClients, getClient } from './queries';
import { createClient, updateClient, deleteClient } from './mutations';

export const clientApi = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};

export * from './types';
export * from './queries';
export * from './mutations';
