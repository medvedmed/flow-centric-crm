
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, DollarSign, Plus } from 'lucide-react';
import { format } from 'date-fns';
import DragDropScheduler from './DragDropScheduler';

interface Appointment {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientPhone: string;
  service: string;
  price: number;
  status: string;
  duration: number;
}

interface Staff {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  workingHours: { start: string; end: string };
  efficiency: number;
  rating: number;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface AppointmentSchedulerProps {
  selectedDate: Date;
  onAppointmentMove: (appointmentId: string, newStaffId: string, newTime: string) => void;
}

// Mock data - in real app this would come from props or API
const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    image: '/placeholder.svg',
    specialties: ['Hair Coloring', 'Styling'],
    workingHours: { start: '09:00', end: '17:00' },
    efficiency: 95,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Mike Chen',
    image: '/placeholder.svg',
    specialties: ['Haircut', 'Beard Trim'],
    workingHours: { start: '10:00', end: '18:00' },
    efficiency: 88,
    rating: 4.6
  },
  {
    id: '3',
    name: 'Emma Davis',
    image: '/placeholder.svg',
    specialties: ['Manicure', 'Pedicure'],
    workingHours: { start: '08:00', end: '16:00' },
    efficiency: 92,
    rating: 4.9
  }
];

const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    staffId: '1',
    startTime: '09:00',
    endTime: '10:30',
    clientName: 'Alice Smith',
    clientPhone: '+1-555-0123',
    service: 'Hair Coloring',
    price: 120,
    status: 'confirmed',
    duration: 90
  },
  {
    id: 'apt-2',
    staffId: '1',
    startTime: '11:00',
    endTime: '12:00',
    clientName: 'Bob Wilson',
    clientPhone: '+1-555-0456',
    service: 'Haircut & Style',
    price: 65,
    status: 'confirmed',
    duration: 60
  },
  {
    id: 'apt-3',
    staffId: '2',
    startTime: '10:00',
    endTime: '11:00',
    clientName: 'Carol Brown',
    clientPhone: '+1-555-0789',
    service: 'Beard Trim',
    price: 35,
    status: 'upcoming',
    duration: 60
  }
];

// Generate time slots from 8 AM to 8 PM in 15-minute intervals
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 20 && minute > 0) break; // Stop at 8:00 PM
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        hour,
        minute
      });
    }
  }
  return slots;
};

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  selectedDate,
  onAppointmentMove
}) => {
  const [timeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule - {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </CardTitle>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[600px] overflow-auto">
          <DragDropScheduler
            staff={mockStaff}
            appointments={mockAppointments}
            timeSlots={timeSlots}
            onAppointmentMove={onAppointmentMove}
          />
        </div>
      </CardContent>
    </Card>
  );
};
