
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Phone } from 'lucide-react';
import { Appointment } from '@/services/types';
import { normalizeTime } from './utils';

interface AppointmentBlockProps {
  appointment: Appointment;
  isDragging?: boolean;
}

export const AppointmentBlock: React.FC<AppointmentBlockProps> = ({ 
  appointment, 
  isDragging = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: appointment.id,
    data: {
      appointment,
      type: 'appointment'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.8 : 1,
  };

  const statusColors = {
    'Scheduled': 'bg-blue-50 border-l-blue-500 text-blue-900',
    'Confirmed': 'bg-green-50 border-l-green-500 text-green-900', 
    'In Progress': 'bg-purple-50 border-l-purple-500 text-purple-900',
    'Completed': 'bg-gray-50 border-l-gray-500 text-gray-900',
    'Cancelled': 'bg-red-50 border-l-red-500 text-red-900',
    'No Show': 'bg-orange-50 border-l-orange-500 text-orange-900'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing w-full rounded-md border-l-4 p-2 mb-1 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        statusColors[appointment.status as keyof typeof statusColors] || statusColors.Scheduled
      } ${isDragging ? 'z-50 rotate-2 scale-105 shadow-lg' : ''}`}
    >
      <div className="space-y-1 overflow-hidden">
        {/* Time and Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs font-semibold truncate">
              {normalizeTime(appointment.startTime)}-{normalizeTime(appointment.endTime)}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs px-1 py-0 flex-shrink-0">
            {appointment.status}
          </Badge>
        </div>
        
        {/* Client Name */}
        <div className="flex items-center gap-1 min-w-0">
          <User className="w-3 h-3 text-gray-600 flex-shrink-0" />
          <p className="font-medium text-sm truncate">{appointment.clientName}</p>
        </div>
        
        {/* Service and Price Row */}
        <div className="flex items-center justify-between min-w-0">
          <p className="text-xs text-gray-700 truncate flex-1">{appointment.service}</p>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-green-600">${appointment.price}</span>
          </div>
        </div>

        {/* Phone if available */}
        {appointment.clientPhone && (
          <div className="flex items-center gap-1 min-w-0">
            <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">{appointment.clientPhone}</span>
          </div>
        )}
      </div>
    </div>
  );
};
