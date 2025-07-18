
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Phone, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, startOfDay } from 'date-fns';
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

      // Fetch appointments with explicit query
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id)
        .eq('date', dateString)
        .order('start_time');

      if (appointmentsError) {
        console.error('Appointments fetch error:', appointmentsError);
        throw appointmentsError;
      }

      // Map staff data
      const mappedStaff = staffData?.map(staffMember => ({
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
        staffLoginPassword: staffMember.staff_login_password,
        createdAt: staffMember.created_at,
        updatedAt: staffMember.updated_at
      })) || [];

      // Map appointments data
      const mappedAppointments = appointmentsData?.map(appointment => ({
        id: appointment.id,
        clientId: appointment.client_id,
        staffId: appointment.staff_id,
        clientName: appointment.client_name,
        clientPhone: appointment.client_phone,
        service: appointment.service,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        date: appointment.date,
        price: appointment.price,
        duration: appointment.duration || 60,
        status: appointment.status as Appointment['status'],
        notes: appointment.notes,
        salonId: appointment.salon_id,
        paymentStatus: (appointment.payment_status || 'unpaid') as 'paid' | 'unpaid' | 'partial',
        paymentMethod: appointment.payment_method,
        paymentDate: appointment.payment_date,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      })) || [];

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
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unpaid': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleTimeSlotClick = (staffId: string, time: string) => {
    if (onTimeSlotClick) {
      onTimeSlotClick({
        date: selectedDate,
        time: time,
        staffId: staffId
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <span className="ml-2">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMMM d')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, 'yyyy')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday} className="mt-2">
            Today
          </Button>
        </CardHeader>
      </Card>

      {/* Staff Schedule */}
      <div className="space-y-4">
        {staff.map((staffMember) => {
          const staffAppointments = appointments.filter(apt => apt.staffId === staffMember.id);
          
          return (
            <Card key={staffMember.id} className="bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-violet-600" />
                  <div>
                    <CardTitle className="text-base">{staffMember.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {staffMember.workingHoursStart} - {staffMember.workingHoursEnd}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {staffAppointments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No appointments scheduled</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleTimeSlotClick(staffMember.id, staffMember.workingHoursStart)}
                    >
                      Add Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {staffAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => onAppointmentClick?.(appointment)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-violet-600" />
                              <span className="font-medium">
                                {appointment.startTime} - {appointment.endTime}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900 mb-1">
                              {appointment.clientName}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              {appointment.service}
                            </p>
                            {appointment.clientPhone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                {appointment.clientPhone}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getStatusColor(appointment.status)} variant="outline">
                              {appointment.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(appointment.paymentStatus)} variant="outline">
                              {appointment.paymentStatus}
                            </Badge>
                            <span className="text-sm font-medium text-green-600">
                              ${appointment.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {staff.length === 0 && (
        <Card>
          <CardContent className="text-center py-6">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No staff members found</p>
            <p className="text-sm text-gray-500 mt-1">
              Add staff members to start scheduling appointments
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
