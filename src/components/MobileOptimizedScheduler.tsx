
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Phone, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment, Staff } from '@/services/types';

interface MobileOptimizedSchedulerProps {
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (slotData: any) => void;
}

export const MobileOptimizedScheduler: React.FC<MobileOptimizedSchedulerProps> = ({
  onAppointmentClick,
  onTimeSlotClick
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const startOfDay = `${dateString}T00:00:00`;
      const endOfDay = `${dateString}T23:59:59`;

      // Fetch staff with explicit query
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (staffError) {
        console.error('Staff fetch error:', staffError);
        throw staffError;
      }

      // Fetch appointments with related data - using timestamp range for date filtering
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          clients:client_id(full_name, phone),
          services:service_id(name, price, duration)
        `)
        .eq('organization_id', user.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time');

      if (appointmentsError) {
        console.error('Appointments fetch error:', appointmentsError);
        throw appointmentsError;
      }

      // Map staff data
      const mappedStaff = (staffData || []).map(staffMember => ({
        id: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        specialties: staffMember.specialties || [],
        workingHoursStart: staffMember.working_hours_start || '09:00',
        workingHoursEnd: staffMember.working_hours_end || '17:00',
        workingDays: staffMember.working_days || [],
        breakStart: staffMember.break_start,
        breakEnd: staffMember.break_end,
        efficiency: staffMember.efficiency || 100,
        rating: staffMember.rating || 5.0,
        imageUrl: staffMember.image_url,
        hourlyRate: staffMember.hourly_rate || 0,
        commissionRate: staffMember.commission_rate || 35,
        status: staffMember.status as Staff['status'],
        notes: staffMember.notes,
        hireDate: staffMember.hire_date,
        salonId: staffMember.salon_id,
        staffCode: staffMember.staff_code,
        staffLoginId: staffMember.staff_login_id,
        hasCredentials: !!(staffMember.staff_login_id && staffMember.staff_login_password),
        createdAt: staffMember.created_at,
        updatedAt: staffMember.updated_at
      }));

      // Map appointments data with related client/service info
      const mappedAppointments = (appointmentsData || []).map((appointment: any) => {
        const clientName = appointment.clients?.full_name || 'Unknown Client';
        const clientPhone = appointment.clients?.phone || '';
        const serviceName = appointment.services?.name || 'Service';
        const servicePrice = appointment.services?.price || 0;
        const serviceDuration = appointment.services?.duration || appointment.duration || 60;
        
        // Extract date from timestamp
        const startDate = new Date(appointment.start_time);
        const dateStr = format(startDate, 'yyyy-MM-dd');
        const startTimeStr = format(startDate, 'HH:mm');
        const endDate = new Date(appointment.end_time);
        const endTimeStr = format(endDate, 'HH:mm');

        return {
          id: appointment.id,
          clientId: appointment.client_id,
          staffId: appointment.staff_id,
          clientName: clientName,
          clientPhone: clientPhone,
          service: serviceName,
          startTime: startTimeStr,
          endTime: endTimeStr,
          date: dateStr,
          price: servicePrice,
          duration: serviceDuration,
          status: (appointment.status || 'Scheduled') as Appointment['status'],
          notes: appointment.notes,
          salonId: appointment.organization_id,
          paymentStatus: (appointment.status === 'Completed' ? 'paid' : 'unpaid') as 'paid' | 'unpaid' | 'partial',
          color: appointment.color,
          createdAt: appointment.created_at,
          updatedAt: appointment.updated_at
        };
      });

      setStaff(mappedStaff);
      setAppointments(mappedAppointments);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments and staff data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, user]);

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'No Show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'partial': return 'bg-amber-100 text-amber-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return 'Unassigned';
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember?.name || 'Unknown';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading appointments...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule
          </CardTitle>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {format(selectedDate, 'EEEE')}
            </div>
            <div className="text-sm text-gray-500">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={goToNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No appointments for this day</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => onTimeSlotClick?.({ date: selectedDate, time: '09:00' })}
            >
              Add an appointment
            </Button>
          </div>
        ) : (
          appointments.map((appointment) => (
            <Card 
              key={appointment.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
              style={{ borderLeftColor: appointment.color || '#6366f1' }}
              onClick={() => onAppointmentClick?.(appointment)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {appointment.startTime} - {appointment.endTime}
                    </span>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{appointment.clientName}</span>
                  </div>
                  
                  {appointment.clientPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{appointment.clientPhone}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{appointment.service}</span>
                    <span className="font-semibold text-green-600">
                      ${appointment.price?.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {getStaffName(appointment.staffId)}
                    </span>
                    <Badge className={getPaymentStatusColor(appointment.paymentStatus || 'unpaid')}>
                      {appointment.paymentStatus || 'unpaid'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};
