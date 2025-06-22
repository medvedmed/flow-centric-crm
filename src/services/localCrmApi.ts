
import { webhookService } from './webhookService';

export interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Regular' | 'VIP' | 'Active' | 'Inactive';
  assignedStaff: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id?: string;
  clientId: string;
  clientName: string;
  service: string;
  startTime: string;
  endTime: string;
  date: string;
  price: number;
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  staffId: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

class LocalCrmApi {
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private getStorageKey(type: 'clients' | 'appointments'): string {
    return `aura_salon_${type}`;
  }

  // Client methods
  async getClients(searchTerm?: string): Promise<Client[]> {
    const clients = JSON.parse(localStorage.getItem(this.getStorageKey('clients')) || '[]');
    
    if (!searchTerm) return clients;
    
    return clients.filter((client: Client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }

  async getClient(id: string): Promise<Client | null> {
    const clients = await this.getClients();
    return clients.find(client => client.id === id) || null;
  }

  async createClient(clientData: Omit<Client, 'id'>): Promise<Client> {
    const clients = await this.getClients();
    const newClient: Client = {
      ...clientData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    clients.push(newClient);
    localStorage.setItem(this.getStorageKey('clients'), JSON.stringify(clients));
    
    // Send webhook notification to n8n
    await webhookService.clientCreated(newClient);
    
    return newClient;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const clients = await this.getClients();
    const index = clients.findIndex(client => client.id === id);
    
    if (index === -1) {
      throw new Error('Client not found');
    }
    
    clients[index] = {
      ...clients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(this.getStorageKey('clients'), JSON.stringify(clients));
    
    return clients[index];
  }

  async deleteClient(id: string): Promise<void> {
    const clients = await this.getClients();
    const filteredClients = clients.filter(client => client.id !== id);
    localStorage.setItem(this.getStorageKey('clients'), JSON.stringify(filteredClients));
  }

  // Appointment methods
  async getAppointments(clientId?: string, staffId?: string): Promise<Appointment[]> {
    const appointments = JSON.parse(localStorage.getItem(this.getStorageKey('appointments')) || '[]');
    
    let filtered = appointments;
    if (clientId) {
      filtered = filtered.filter((apt: Appointment) => apt.clientId === clientId);
    }
    if (staffId) {
      filtered = filtered.filter((apt: Appointment) => apt.staffId === staffId);
    }
    
    return filtered;
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    const appointments = await this.getAppointments();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    appointments.push(newAppointment);
    localStorage.setItem(this.getStorageKey('appointments'), JSON.stringify(appointments));
    
    // Send webhook notification to n8n
    await webhookService.appointmentCreated(newAppointment);
    
    return newAppointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const appointments = await this.getAppointments();
    const index = appointments.findIndex(apt => apt.id === id);
    
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    
    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(this.getStorageKey('appointments'), JSON.stringify(appointments));
    
    // Send webhook notification to n8n
    await webhookService.appointmentUpdated(appointments[index]);
    
    return appointments[index];
  }

  async deleteAppointment(id: string): Promise<void> {
    const appointments = await this.getAppointments();
    const filteredAppointments = appointments.filter(apt => apt.id !== id);
    localStorage.setItem(this.getStorageKey('appointments'), JSON.stringify(filteredAppointments));
  }
}

export const localCrmApi = new LocalCrmApi();
