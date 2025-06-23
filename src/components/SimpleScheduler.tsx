
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, DollarSign, Plus, Calendar } from 'lucide-react';
import { Staff, Appointment } from '@/services/types';
import { AddAppointmentDialog } from './AddAppointmentDialog';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface SimpleSchedulerProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onRefresh: () => void;
}

const SimpleScheduler: React.FC<SimpleSchedulerProps> = ({
  staff,
  appointments,
  selectedDate,
  onRefresh
}) => {
  // Generate time slots from 9 AM to 6 PM
  const timeSlots: TimeSlot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push({
        time: timeString,
        hour,
        minute
      });
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAppointmentsForStaffAndTime = (staffId: string, time: string) => {
    return appointments.filter(apt => 
      apt.staffId === staffId && apt.startTime === time
    );
  };

  if (staff.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Staff Members Found</h3>
          <p className="text-gray-500 text-center mb-4">
            You need to add staff members before you can view the schedule.
          </p>
          <Button onClick={onRefresh} variant="outline">
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {staff.map(staffMember => (
          <Card key={staffMember.id} className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={staffMember.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.name}`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                    {getInitials(staffMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{staffMember.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{staffMember.rating || 5.0}⭐</span>
                    <span>•</span>
                    <span>{staffMember.efficiency || 100}%</span>
                  </div>
                  {staffMember.specialties && staffMember.specialties.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {staffMember.specialties.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {timeSlots.map(slot => {
                const slotAppointments = getAppointmentsForStaffAndTime(staffMember.id || '', slot.time);
                
                return (
                  <div key={`${staffMember.id}-${slot.time}`} className="border-b border-gray-100 pb-2 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{slot.time}</span>
                      {slotAppointments.length === 0 && (
                        <AddAppointmentDialog
                          selectedDate={selectedDate}
                          selectedTime={slot.time}
                          selectedStaffId={staffMember.id}
                          trigger={
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Plus className="w-4 h-4" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                    
                    {slotAppointments.map(appointment => (
                      <div key={appointment.id} className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-blue-600" />
                            <span className="font-medium text-sm">{appointment.clientName}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-1">{appointment.service}</div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {appointment.startTime} - {appointment.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-600">
                              ${appointment.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimpleScheduler;
