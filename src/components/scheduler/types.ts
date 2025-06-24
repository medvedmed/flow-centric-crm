
import { Staff, Appointment } from '@/services/types';

export interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

export interface DragDropSchedulerProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentMove?: (appointmentId: string, newStaffId: string, newTime: string) => void;
  onRefresh?: () => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}
