
export interface Client {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  status: 'New' | 'Regular' | 'VIP' | 'Active' | 'Inactive';
  assignedStaff?: string;
  notes?: string;
  tags?: string;
  totalSpent?: number;
  visits?: number;
  preferredStylist?: string;
  lastVisit?: string;
  salonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Staff {
  id?: string;
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
  status?: 'active' | 'inactive' | 'on_leave';
  notes?: string;
  hireDate?: string;
  salonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id?: string;
  clientId?: string;
  staffId: string;
  clientName: string;
  clientPhone?: string;
  service: string;
  startTime: string;
  endTime: string;
  date: string;
  price?: number;
  duration?: number;
  status?: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  salonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  salonName?: string;
  phone?: string;
  role: 'salon_owner' | 'staff' | 'admin';
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired';
  subscriptionEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeOffRequest {
  id?: string;
  staffId: string;
  salonId?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffAvailability {
  id?: string;
  staffId: string;
  salonId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}
