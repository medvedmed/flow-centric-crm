
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractiveAppointmentCard } from './InteractiveAppointmentCard';
import { useRealtimeAppointments } from '@/hooks/useRealtimeAppointments';
import { format } from 'date-fns';

interface EnhancedDragDropSchedulerProps {
  staff: any[];
  appointments: any[];
  selectedDate: Date;
  onAppointmentMove?: (appointmentId: string, newStaffId: string, newTime: string) => void;
  onRefresh?: () => void;
}

const EnhancedDragDropScheduler: React.FC<EnhancedDragDropSchedulerProps> = ({
  staff,
  appointments,
  selectedDate,
  onAppointmentMove,
  onRefresh
}) => {
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  // Enable real-time updates
  useRealtimeAppointments(dateString);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const getAppointmentsForSlot = (staffId: string, timeSlot: string) => {
    return appointments.filter(apt => 
      apt.staff_id === staffId && 
      apt.start_time.substring(0, 5) === timeSlot &&
      apt.date === dateString
    );
  };

  const handleAppointmentUpdate = (appointmentId: string) => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-50 border-b">
        <div className="grid grid-cols-[100px_1fr] gap-0">
          <div className="p-4 border-r bg-gray-100">
            <span className="text-sm font-medium text-gray-600">Time</span>
          </div>
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${staff.length}, 1fr)` }}>
            {staff.map((member) => (
              <div key={member.id} className="p-4 border-r border-gray-200 last:border-r-0">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {member.specialties?.[0] || 'General'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="grid grid-cols-[100px_1fr] border-b border-gray-100 min-h-[80px]">
              {/* Time Column */}
              <div className="p-3 border-r bg-gray-50 flex items-start">
                <span className="text-sm font-medium text-gray-600">{timeSlot}</span>
              </div>
              
              {/* Staff Columns */}
              <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${staff.length}, 1fr)` }}>
                {staff.map((member) => {
                  const slotAppointments = getAppointmentsForSlot(member.id, timeSlot);
                  
                  return (
                    <div 
                      key={member.id} 
                      className="p-2 border-r border-gray-100 last:border-r-0 min-h-[80px] hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-2">
                        {slotAppointments.map((appointment) => (
                          <InteractiveAppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onAppointmentUpdate={handleAppointmentUpdate}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDragDropScheduler;
