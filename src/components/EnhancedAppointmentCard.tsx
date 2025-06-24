
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Phone } from 'lucide-react';
import { AppointmentActions } from './AppointmentActions';

interface EnhancedAppointmentCardProps {
  appointment: {
    id: string;
    clientName: string;
    clientPhone?: string;
    service: string;
    startTime: string;
    endTime: string;
    price?: number;
    duration?: number;
    status: string;
    notes?: string;
    date: string;
  };
  onUpdate?: () => void;
  className?: string;
}

export const EnhancedAppointmentCard: React.FC<EnhancedAppointmentCardProps> = ({
  appointment,
  onUpdate,
  className = ""
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'border-l-green-500 bg-green-50';
      case 'cancelled':
        return 'border-l-red-500 bg-red-50';
      case 'no show':
        return 'border-l-gray-500 bg-gray-50';
      case 'in progress':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-purple-500 bg-purple-50';
    }
  };

  return (
    <Card className={`${getStatusColor(appointment.status)} border-l-4 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm">
                {appointment.startTime} - {appointment.endTime}
              </span>
              {appointment.duration && (
                <Badge variant="secondary" className="text-xs">
                  {appointment.duration}min
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="font-semibold">{appointment.clientName}</span>
            </div>
            
            {appointment.clientPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{appointment.clientPhone}</span>
              </div>
            )}
            
            <div className="text-sm font-medium text-gray-800">
              {appointment.service}
            </div>
            
            {appointment.price && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">${appointment.price}</span>
              </div>
            )}
            
            {appointment.notes && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                {appointment.notes}
              </div>
            )}
          </div>
          
          <div className="ml-4">
            <AppointmentActions 
              appointment={appointment} 
              onUpdate={onUpdate}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
