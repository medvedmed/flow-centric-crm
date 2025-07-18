import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, User, Phone, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';

interface MobileAppointment {
  id: string;
  client_name: string;
  client_phone?: string;
  service: string;
  start_time: string;
  end_time: string;
  price: number;
  status: string;
  payment_status: string;
  staff_name?: string;
  color?: string;
}

interface MobileOptimizedSchedulerProps {
  onAppointmentClick?: (appointment: any) => void;
  onTimeSlotClick?: (slotInfo: any) => void;
}

export const MobileOptimizedScheduler: React.FC<MobileOptimizedSchedulerProps> = ({
  onAppointmentClick,
  onTimeSlotClick
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<MobileAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, user]);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const startDate = startOfDay(selectedDate).toISOString().split('T')[0];
      const endDate = endOfDay(selectedDate).toISOString().split('T')[0];

      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          id,
          client_name,
          client_phone,
          service,
          start_time,
          end_time,
          price,
          status,
          payment_status,
          staff:staff_id (
            name
          )
        `)
        .eq('salon_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('start_time');

      if (error) throw error;

      const formattedAppointments = appointmentsData?.map(apt => ({
        ...apt,
        staff_name: (apt.staff as any)?.name || 'Unassigned',
        color: getStatusColor(apt.payment_status)
      })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'unpaid': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      unpaid: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

  const handleTimeSlotClick = (time: string) => {
    if (onTimeSlotClick) {
      onTimeSlotClick({
        date: selectedDate,
        time: time,
        staffId: null
      });
    }
  };

  const appointmentsForTime = (time: string) => {
    return appointments.filter(apt => {
      const aptStartTime = apt.start_time.substring(0, 5); // Get HH:MM format
      return aptStartTime === time;
    });
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="text-lg">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-1 p-4">
            {timeSlots.map((time) => {
              const appointmentsAtTime = appointmentsForTime(time);
              
              return (
                <div key={time} className="border-b border-gray-100 py-2">
                  <div className="flex items-start gap-3">
                    {/* Time Column */}
                    <div className="w-16 text-sm font-medium text-gray-600 mt-1">
                      {time}
                    </div>
                    
                    {/* Appointments Column */}
                    <div className="flex-1 min-h-[40px] relative">
                      {appointmentsAtTime.length === 0 ? (
                        <Button
                          variant="ghost"
                          className="w-full h-10 text-left justify-start border-dashed border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50"
                          onClick={() => handleTimeSlotClick(time)}
                        >
                          <span className="text-gray-400 text-sm">+ Add appointment</span>
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          {appointmentsAtTime.map((appointment) => (
                            <Card
                              key={appointment.id}
                              className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4"
                              style={{ borderLeftColor: appointment.color?.replace('bg-', '#') }}
                              onClick={() => onAppointmentClick?.(appointment)}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-sm">{appointment.client_name}</span>
                                  </div>
                                  <Badge 
                                    className={`${getPaymentStatusBadge(appointment.payment_status)} text-xs`}
                                    variant="outline"
                                  >
                                    {appointment.payment_status}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{appointment.start_time} - {appointment.end_time}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-medium">{appointment.service}</span>
                                  </div>
                                  {appointment.client_phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      <span>{appointment.client_phone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span>${appointment.price}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};