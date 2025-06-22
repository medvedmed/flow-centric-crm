
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  salon_name?: string;
  phone?: string;
  role?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'New' | 'Regular' | 'VIP' | 'Inactive';
  assignedStaff?: string;
  notes?: string;
  tags?: string;
  preferredStylist?: string;
  lastVisit?: string;
  visits: number;
  totalSpent: number;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: string[];
  breakStart?: string;
  breakEnd?: string;
  efficiency?: number;
  rating?: number;
  imageUrl?: string;
  hourlyRate?: number;
  commissionRate?: number;
  status: 'active' | 'inactive' | 'on_leave';
  notes?: string;
  hireDate?: string;
  salonId: string;
  staffCode?: string; // Add the new staff_code field
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  staffId?: string;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
  notes?: string;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeOffRequest {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAvailability {
  id: string;
  staffId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
  reason?: string;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientStats {
  totalClients: number;
  newThisMonth: number;
  avgVisitsPerClient: number;
  topSpenders: Client[];
}

export interface Permission {
  area: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface UserPermissions {
  role: string;
  salonId: string | null;
  permissions: Record<string, Permission>;
}
