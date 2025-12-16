
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, User, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { availabilityApi } from '@/services/api/availabilityApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

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
  status?: string;
  price?: number;
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

      // Get user's org_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .maybeSingle();
      
      const orgId = profile?.organization_id || user.id;
      const startOfDay = `${selectedDate}T00:00:00`;
      const endOfDay = `${selectedDate}T23:59:59`;

      // Get appointments
      const { data: aptsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('organization_id', orgId)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time');
      
      if (error) throw error;
      
      // Get related data
      const clientIds = [...new Set((aptsData || []).map(a => a.client_id).filter(Boolean))];
      const serviceIds = [...new Set((aptsData || []).map(a => a.service_id).filter(Boolean))];

      const [clientsRes, servicesRes] = await Promise.all([
        clientIds.length > 0 ? supabase.from('clients').select('id, full_name').in('id', clientIds) : { data: [] },
        serviceIds.length > 0 ? supabase.from('services').select('id, name, price').in('id', serviceIds) : { data: [] }
      ]);

      const clientsMap = new Map((clientsRes.data || []).map(c => [c.id, c]));
      const servicesMap = new Map((servicesRes.data || []).map(s => [s.id, s]));
      
      return (aptsData || []).map(apt => {
        const client = apt.client_id ? clientsMap.get(apt.client_id) : null;
        const service = apt.service_id ? servicesMap.get(apt.service_id) : null;
        return {
          id: apt.id,
          staffId: apt.staff_id,
          title: `${service?.name || 'Service'} - ${client?.full_name || 'Client'}`,
          start: apt.start_time,
          end: apt.end_time,
          type: 'appointment' as const,
          clientName: client?.full_name || 'Unknown Client',
          service: service?.name || 'Service',
          status: apt.status,
          price: service?.price
        };
      });
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
    return appointments.filter(apt => {
      const aptTime = apt.start.includes('T') ? apt.start.split('T')[1].slice(0, 5) : apt.start;
      return apt.staffId === staffId && aptTime === time;
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isLoading = availabilityLoading || appointmentsLoading;

  if (staff.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Staff Members</h3>
          <p className="text-muted-foreground text-center">
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
                className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Staff:</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
            Error loading availability data: {(availabilityError as Error).message}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                    <p className="text-sm text-muted-foreground">{staffMember.email}</p>
                    {staffMember.specialties?.length > 0 && (
                      <p className="text-xs text-muted-foreground">
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
                    <div key={`${staffMember.id}-${time}`} className="border-b border-border pb-2 last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
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
                        <div className="text-xs text-muted-foreground mb-1">
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
                          <div className="text-xs text-muted-foreground">{appointment.service}</div>
                          {appointment.price && (
                            <div className="text-xs text-green-600 font-medium">
                              ${appointment.price}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Show if no data available */}
                      {!availability && !hasAppointments && (
                        <div className="text-xs text-muted-foreground italic">
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
