
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, CreditCard, User, FileText, Star } from 'lucide-react';
import { Appointment } from '@/services/types';
import { format, parseISO, isValid } from 'date-fns';

interface StaffDetails {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  specialties?: string[];
  rating?: number;
}

interface AppointmentDetailsCardProps {
  appointment: Appointment;
  staffDetails?: StaffDetails | null;
}

const formatDate = (dateString: string | undefined | null, formatString: string = 'EEEE, MMMM d, yyyy') => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const AppointmentDetailsCard: React.FC<AppointmentDetailsCardProps> = ({
  appointment,
  staffDetails
}) => {
  const statusColors = {
    'Scheduled': 'bg-blue-100 text-blue-800',
    'Confirmed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-emerald-100 text-emerald-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'No Show': 'bg-orange-100 text-orange-800'
  };

  const paymentStatusColors = {
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-red-100 text-red-800',
    'partial': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Appointment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-medium">{formatDate(appointment.date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time</p>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <p className="font-medium">{appointment.startTime} - {appointment.endTime}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">Service</p>
          <p className="font-medium text-lg">{appointment.service}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium">{appointment.duration || 60} minutes</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="font-medium text-green-600">${appointment.price}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge className={statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
              {appointment.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Payment Status</p>
            <Badge className={paymentStatusColors[appointment.paymentStatus as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'}>
              {appointment.paymentStatus?.toUpperCase() || 'UNPAID'}
            </Badge>
          </div>
        </div>

        {appointment.paymentMethod && (
          <div>
            <p className="text-sm text-gray-600">Payment Method</p>
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <p className="font-medium capitalize">{appointment.paymentMethod}</p>
            </div>
          </div>
        )}

        {staffDetails && (
          <div>
            <p className="text-sm text-gray-600">Staff Member</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <p className="font-medium">{staffDetails.name}</p>
              {staffDetails.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-sm">{staffDetails.rating}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {appointment.notes && (
          <div>
            <p className="text-sm text-gray-600">Notes</p>
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
              <p className="text-sm">{appointment.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
