
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Phone } from 'lucide-react';
import { Appointment } from '@/services/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onClick 
}) => {
  const statusColors = {
    'Scheduled': 'bg-blue-50 border-l-blue-500 text-blue-900 hover:bg-blue-100',
    'Confirmed': 'bg-green-50 border-l-green-500 text-green-900 hover:bg-green-100', 
    'In Progress': 'bg-purple-50 border-l-purple-500 text-purple-900 hover:bg-purple-100',
    'Completed': 'bg-gray-50 border-l-gray-500 text-gray-900 hover:bg-gray-100',
    'Cancelled': 'bg-red-50 border-l-red-500 text-red-900 hover:bg-red-100',
    'No Show': 'bg-orange-50 border-l-orange-500 text-orange-900 hover:bg-orange-100'
  };

  const paymentStatusColors = {
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-red-100 text-red-800',
    'partial': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div
      onClick={() => onClick(appointment)}
      className={`cursor-pointer w-full rounded-lg border-l-4 p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        statusColors[appointment.status as keyof typeof statusColors] || statusColors.Scheduled
      }`}
    >
      <div className="space-y-3">
        {/* Time and Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {appointment.status}
            </Badge>
            {appointment.paymentStatus && (
              <Badge 
                className={`text-xs ${paymentStatusColors[appointment.paymentStatus as keyof typeof paymentStatusColors]}`}
              >
                {appointment.paymentStatus}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Client Name */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          <h3 className="font-medium text-lg">{appointment.clientName}</h3>
        </div>
        
        {/* Service and Price Row */}
        <div className="flex items-center justify-between">
          <p className="text-gray-700 font-medium">{appointment.service}</p>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">${appointment.price}</span>
          </div>
        </div>

        {/* Phone if available */}
        {appointment.clientPhone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{appointment.clientPhone}</span>
          </div>
        )}

        {/* Notes preview */}
        {appointment.notes && (
          <p className="text-sm text-gray-600 italic truncate">
            "{appointment.notes}"
          </p>
        )}
      </div>
    </div>
  );
};
