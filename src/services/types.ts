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
  phone?: string | null;
  status: 'New' | 'Regular' | 'VIP' | 'Inactive' | 'active' | 'inactive';
  assignedStaff?: string | null;
  notes?: string | null;
  tags?: string | null;
  totalSpent?: number | null;
  visits?: number | null;
  preferredStylist?: string | null;
  lastVisit?: string | null;
  salonId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  clientId?: string | null;
  clientPassword?: string | null;
  isPortalEnabled?: boolean | null;
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
  status?: string;
  notes?: string;
  hireDate?: string;
  salonId?: string;
  staffCode?: string;
  staffLoginId?: string;
  staffLoginPassword?: string;
  hasCredentials?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
  is_active: boolean;
  popular: boolean;
  created_at: string;
  updated_at: string;
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
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  paymentMethod?: string;
  paymentDate?: string;
  color?: string;
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

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

export interface ReminderSettings {
  id: string;
  salonId: string;
  reminderTiming: '24_hours' | '2_hours';
  isEnabled: boolean;
  messageTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  reminderType: '24_hours' | '2_hours';
  scheduledTime: string;
  sentAt?: string;
  status: 'pending' | 'ready' | 'sent' | 'skipped';
  whatsappUrl?: string;
  createdAt: string;
  updatedAt: string;
}
