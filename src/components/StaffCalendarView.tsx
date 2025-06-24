
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, User, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { availabilityApi } from '@/services/api/availabilityApi';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  specialties: string[];
}

interface CalendarEvent {
  id: string;
  staffId: string;
  title: string;
  start: string;
  end: string;
  type: 'appointment' | 'availability' | 'time_off';
  clientName?: string;
  service?: string;
  isAvailable?: boolean;
  reason?: string;
}

interface StaffCalendarViewProps {
  staff: StaffMember[];
  events: CalendarEvent[];
  onAddEvent: (event: any) => void;
}

const StaffCalendarView: React.FC<StaffCalendarViewProps> = ({ staff, events, onAddEvent }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');

  // Fetch availability for the selected date
  const { data: availabilityData = [], isLoading: availabilityLoading, error: availabilityError } = useQuery({
    queryKey: ['staff-availability-calendar', selectedDate],
    queryFn: () => availabilityApi.getStaffAvailability(undefined, selectedDate),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch appointments for the selected date
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['staff-appointments-calendar', selectedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id)
        .eq('date', selectedDate)
        .order('start_time');
      
      if (error) throw error;
      
      return data?.map(apt => ({
        id: apt.id,
        staffId: apt.staff_id,
        title: `${apt.service} - ${apt.client_name}`,
        start: `${apt.date}T${apt.start_time}`,
        end: `${apt.date}T${apt.end_time}`,
        type: 'appointment' as const,
        clientName: apt.client_name,
        service: apt.service,
        status: apt.status,
        price: apt.price
      })) || [];
    },
    enabled: !!selectedDate,
    staleTime: 1 * 60 * 1000,
  });

  // Generate time slots from 8 AM to 8 PM
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    timeSlots.push(timeString);
  }

  const filteredStaff = selectedStaff === 'all' ? staff : staff.filter(s => s.id === selectedStaff);

  const getStaffAvailability = (staffId: string, time: string) => {
    return availabilityData.find(av => 
      av.staffId === staffId && 
      av.startTime <= time && 
      av.endTime > time
    );
  };

  const getStaffAppointments = (staffId: string, time: string) => {
    return appointments.filter(apt => 
      apt.staffId === staffId && 
      apt.start.includes(time)
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isLoading = availabilityLoading || appointmentsLoading;

  if (staff.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Staff Members</h3>
          <p className="text-gray-500 text-center">
            Add staff members to view their calendar and availability.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date and Staff Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Staff Calendar View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Staff:</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Staff</option>
                {staff.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {availabilityError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading availability data: {availabilityError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <span className="ml-2">Loading calendar data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Grid */}
      {!isLoading && (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredStaff.map(staffMember => (
            <Card key={staffMember.id} className="h-fit">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={staffMember.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.name}`} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                      {getInitials(staffMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{staffMember.name}</h3>
                    <p className="text-sm text-gray-600">{staffMember.email}</p>
                    {staffMember.specialties?.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {staffMember.specialties.slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {timeSlots.map(time => {
                  const availability = getStaffAvailability(staffMember.id, time);
                  const staffAppointments = getStaffAppointments(staffMember.id, time);
                  const hasAppointments = staffAppointments.length > 0;
                  const isAvailable = availability?.isAvailable !== false;

                  return (
                    <div key={`${staffMember.id}-${time}`} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-sm font-medium">{time}</span>
                          {availability && (
                            <Badge 
                              variant={isAvailable ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          )}
                        </div>
                        {!hasAppointments && isAvailable && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0"
                            onClick={() => onAddEvent({
                              staffId: staffMember.id,
                              date: selectedDate,
                              time: time
                            })}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      {/* Show availability reason if not available */}
                      {availability && !isAvailable && availability.reason && (
                        <div className="text-xs text-gray-600 mb-1">
                          Reason: {availability.reason}
                        </div>
                      )}

                      {/* Show appointments */}
                      {staffAppointments.map(appointment => (
                        <div key={appointment.id} className="mt-1 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-blue-600" />
                              <span className="font-medium text-sm">{appointment.clientName}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">{appointment.service}</div>
                          {appointment.price && (
                            <div className="text-xs text-green-600 font-medium">
                              ${appointment.price}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Show if no data available */}
                      {!availability && !hasAppointments && (
                        <div className="text-xs text-gray-400 italic">
                          No availability set
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Summary for {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Total Staff</div>
              <div className="text-2xl font-bold text-blue-600">{filteredStaff.length}</div>
            </div>
            <div>
              <div className="font-medium">Availability Records</div>
              <div className="text-2xl font-bold text-green-600">{availabilityData.length}</div>
            </div>
            <div>
              <div className="font-medium">Appointments</div>
              <div className="text-2xl font-bold text-purple-600">{appointments.length}</div>
            </div>
            <div>
              <div className="font-medium">Available Slots</div>
              <div className="text-2xl font-bold text-teal-600">
                {availabilityData.filter(av => av.isAvailable).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffCalendarView;
