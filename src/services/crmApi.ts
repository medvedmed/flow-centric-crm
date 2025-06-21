

const API_BASE_URL = process.env.REACT_APP_CRM_API_URL || 'http://localhost:3000';
const API_KEY = process.env.REACT_APP_CRM_API_KEY || 'your-api-key';

export interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  status?: 'Active' | 'Inactive' | 'VIP' | 'New' | 'Regular';
  tags?: string;
  notes?: string;
  assignedStaff?: string;
  createdAt?: string;
  lastVisit?: string;
  totalSpent?: number;
  visits?: number;
  preferredStylist?: string;
}

export interface Appointment {
  id?: string;
  clientId: string;
  staffId: string;
  service: string;
  startTime: string;
  endTime: string;
  status?: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt?: string;
  price?: number;
  duration?: number;
  clientName?: string;
  clientPhone?: string;
}

class CRMApi {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...options.headers,
      },
    };

    console.log(`Making API request to: ${url}`, config);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Client methods - Updated to match your backend structure
  async createClient(client: Client): Promise<Client> {
    return this.makeRequest('clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  async getClients(searchTerm?: string): Promise<Client[]> {
    const params = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    return this.makeRequest(`clients${params}`);
  }

  async getClient(id: string): Promise<Client> {
    return this.makeRequest(`clients/${id}`);
  }

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    return this.makeRequest(`clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  async deleteClient(id: string): Promise<void> {
    return this.makeRequest(`clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointment methods - Updated to match your backend structure
  async createAppointment(appointment: Appointment): Promise<Appointment> {
    return this.makeRequest('appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  async getAppointments(clientId?: string, staffId?: string): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (staffId) params.append('staffId', staffId);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    return this.makeRequest(`appointments${queryString}`);
  }

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    return this.makeRequest(`appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    });
  }

  async deleteAppointment(id: string): Promise<void> {
    return this.makeRequest(`appointments/${id}`, {
      method: 'DELETE',
    });
  }
}

export const crmApi = new CRMApi();

