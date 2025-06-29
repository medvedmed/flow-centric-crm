
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Phone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Appointment, Staff } from '@/services/types';
import { AppointmentDetailsDialog } from '@/components/AppointmentDetailsDialog';

interface SimpleSchedulerProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

const generateTimeSlots = () => {
  const timeSlots = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push({ time, hour, minute });
    }
  }
  return timeSlots;
};

const normalizeTime = (time: string) => {
  if (!time) return '';
  return time.length === 5 ? time : time.padStart(5, '0');
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const statusColors = {
  'Scheduled': 'bg-blue-50 border-l-blue-500 text-blue-900',
  'Confirmed': 'bg-green-50 border-l-green-500 text-green-900', 
  'In Progress': 'bg-purple-50 border-l-purple-500 text-purple-900',
  'Completed': 'bg-gray-50 border-l-gray-500 text-gray-900',
  'Cancelled': 'bg-red-50 border-l-red-500 text-red-900',
  'No Show': 'bg-orange-50 border-l-orange-500 text-orange-900'
};

const paymentStatusColors = {
  'paid': 'bg-green-100 text-green-800',
  'unpaid': 'bg-red-100 text-red-800',
  'partial': 'bg-yellow-100 text-yellow-800'
};

export const SimpleScheduler: React.FC<SimpleSchedulerProps> = ({
  staff,
  appointments,
  selectedDate,
  onAppointmentClick
}) => {
  const timeSlots = generateTimeSlots();

  const getAppointmentsForStaffAndTime = (staffId: string, time: string) => {
    const normalizedTime = normalizeTime(time);
    return appointments.filter(apt => {
      const normalizedStartTime = normalizeTime(apt.startTime);
      return apt.staffId === staffId && normalizedStartTime === normalizedTime;
    });
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log('Appointment clicked:', appointment);
    onAppointmentClick(appointment);
  };

  if (staff.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Staff Available</h3>
        <p className="text-gray-600 text-center mb-4">
          Add staff members to start scheduling appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white overflow-hidden flex flex-col">
      {/* Debug Info */}
      <div className="bg-gray-100 p-2 text-xs text-gray-600 border-b">
        <p>Total appointments: {appointments.length} | Staff: {staff.length} | Date: {selectedDate.toDateString()}</p>
      </div>

      {/* Staff Header */}
      <div 
        className="sticky top-0 z-20 bg-white border-b-2 border-gray-400 shadow-sm flex-shrink-0"
        style={{ 
          display: 'grid',
          gridTemplateColumns: `100px repeat(${staff.length}, 1fr)` 
        }}
      >
        <div className="p-2 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center">
          <span className="font-bold text-gray-800 text-xs">TIME</span>
        </div>
        
        {staff.map((staffMember) => (
          <div 
            key={staffMember.id} 
            className="p-2 border-r-2 border-gray-400 last:border-r-0 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
          >
            <div className="flex flex-col items-center gap-1">
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage src={staffMember.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.name}`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                  {getInitials(staffMember.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center w-full overflow-hidden">
                <h3 className="font-semibold text-gray-800 text-xs truncate">{staffMember.name}</h3>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                  <span className="text-xs">{staffMember.rating || 5.0}⭐</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto">
        {timeSlots.map((timeSlot, timeIndex) => (
          <div 
            key={timeSlot.time} 
            className={`border-b border-gray-300 hover:bg-gray-50/30 transition-colors ${
              timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'
            }`}
            style={{ 
              display: 'grid',
              gridTemplateColumns: `100px repeat(${staff.length}, 1fr)`,
              minHeight: '60px'
            }}
          >
            {/* Time Label */}
            <div className="p-2 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center sticky left-0 z-10">
              <span className="text-xs font-semibold text-gray-800">{timeSlot.time}</span>
            </div>
            
            {/* Staff Columns */}
            {staff.map((staffMember, staffIndex) => {
              const slotAppointments = getAppointmentsForStaffAndTime(staffMember.id || '', timeSlot.time);
              
              return (
                <div 
                  key={`${staffMember.id}-${timeSlot.time}`}
                  className={`p-1 border-r-2 border-gray-400 last:border-r-0 min-h-[60px] overflow-hidden relative ${
                    staffIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {slotAppointments.length > 0 ? (
                    <div className="w-full overflow-hidden">
                      {slotAppointments.map(appointment => (
                        <div
                          key={appointment.id}
                          onClick={() => handleAppointmentClick(appointment)}
                          className={`cursor-pointer w-full rounded-md border-l-4 p-2 mb-1 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                            statusColors[appointment.status as keyof typeof statusColors] || statusColors.Scheduled
                          }`}
                        >
                          <div className="space-y-1 overflow-hidden">
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
                            
                            <div className="flex items-center gap-1 min-w-0">
                              <User className="w-3 h-3 text-gray-600 flex-shrink-0" />
                              <p className="font-medium text-sm truncate">{appointment.clientName}</p>
                            </div>
                            
                            <div className="flex items-center justify-between min-w-0">
                              <p className="text-xs text-gray-700 truncate flex-1">{appointment.service}</p>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-600">
                                  ${Number(appointment.price || 0).toFixed(0)}
                                </span>
                              </div>
                            </div>

                            {appointment.clientPhone && (
                              <div className="flex items-center gap-1 min-w-0">
                                <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                <span className="text-xs text-gray-500 truncate">{appointment.clientPhone}</span>
                              </div>
                            )}

                            {/* Payment Status Indicator */}
                            {appointment.paymentStatus && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Payment:</span>
                                <Badge 
                                  className={`text-xs px-1 py-0 ${
                                    paymentStatusColors[appointment.paymentStatus as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {appointment.paymentStatus?.toUpperCase()}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center hover:bg-gray-50/50 transition-colors rounded">
                      <AddAppointmentDialog
                        selectedDate={selectedDate}
                        selectedTime={timeSlot.time}
                        selectedStaffId={staffMember.id}
                        trigger={
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-200/60">
                            <Plus className="w-3 h-3 text-gray-400" />
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
