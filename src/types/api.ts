
import { Client, Appointment, Staff } from '@/services/types';

// Creation payload types (without auto-generated fields)
export interface CreateClientPayload {
  name: string;
  email: string;
  phone?: string | null;
  status: Client['status'];
  assignedStaff?: string | null;
  notes?: string | null;
  tags?: string | null;
  totalSpent?: number | null;
  visits?: number | null;
  preferredStylist?: string | null;
  lastVisit?: string | null;
  clientId?: string | null;
  clientPassword?: string | null;
  isPortalEnabled?: boolean | null;
}

export interface CreateAppointmentPayload {
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  staffId?: string;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: Appointment['status'];
  notes?: string;
}

export interface CreateStaffPayload {
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
  status?: Staff['status'];
  notes?: string;
  hireDate?: string;
}
