
import React, { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Appointment } from "@/services/types";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    appointment: Appointment;
    staffName: string;
    clientPhone: string;
    price: number;
    status: string;
  };
}

interface DragDropCalendarProps {
  onAppointmentClick?: (appointment: Appointment) => void;
}

const DragDropCalendar: React.FC<DragDropCalendarProps> = ({ onAppointmentClick }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch appointments and format for calendar
  const fetchEvents = useCallback(async () => {
    if (!user) return;

    try {
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          staff!appointments_staff_id_fkey(name)
        `)
        .eq("salon_id", user.id)
        .gte("date", moment().subtract(1, 'month').format('YYYY-MM-DD'))
        .lte("date", moment().add(2, 'months').format('YYYY-MM-DD'));

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        return;
      }

      const formattedEvents: CalendarEvent[] = appointments?.map(apt => {
        const startDateTime = moment(`${apt.date} ${apt.start_time}`).toDate();
        const endDateTime = moment(`${apt.date} ${apt.end_time}`).toDate();

        return {
          id: apt.id,
          title: `${apt.client_name} - ${apt.service}`,
          start: startDateTime,
          end: endDateTime,
          resource: {
            appointment: {
              id: apt.id,
              clientId: apt.client_id,
              staffId: apt.staff_id,
              clientName: apt.client_name,
              clientPhone: apt.client_phone,
              service: apt.service,
              startTime: apt.start_time,
              endTime: apt.end_time,
              date: apt.date,
              price: apt.price,
              duration: apt.duration || 60,
              status: apt.status as Appointment['status'],
              notes: apt.notes,
              salonId: apt.salon_id,
              paymentStatus: (apt.payment_status || 'unpaid') as 'paid' | 'unpaid' | 'partial',
              paymentMethod: apt.payment_method,
              paymentDate: apt.payment_date,
              createdAt: apt.created_at,
              updatedAt: apt.updated_at
            },
            staffName: apt.staff?.name || 'Unassigned',
            clientPhone: apt.client_phone || '',
            price: apt.price || 0,
            status: apt.status || 'Scheduled'
          }
        };
      }) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Handle drag and drop
  const moveEvent = async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    try {
      // Update local state immediately for better UX
      const updatedEvents = events.map(ev =>
        ev.id === event.id ? { ...ev, start, end } : ev
      );
      setEvents(updatedEvents);

      // Calculate new date and times
      const newDate = moment(start).format('YYYY-MM-DD');
      const newStartTime = moment(start).format('HH:mm:ss');
      const newEndTime = moment(end).format('HH:mm:ss');

      // Update in Supabase
      const { error } = await supabase
        .from("appointments")
        .update({
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          updated_at: new Date().toISOString()
        })
        .eq("id", event.id);

      if (error) {
        console.error('Error updating appointment:', error);
        // Revert local changes on error
        setEvents(events);
        toast({
          title: "Error",
          description: "Failed to update appointment time",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Appointment time updated successfully",
        });
      }
    } catch (error) {
      console.error('Error moving event:', error);
      // Revert local changes on error
      setEvents(events);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  // Handle event resize
  const resizeEvent = async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    try {
      // Update local state immediately
      const updatedEvents = events.map(ev =>
        ev.id === event.id ? { ...ev, start, end } : ev
      );
      setEvents(updatedEvents);

      // Calculate new times and duration
      const newStartTime = moment(start).format('HH:mm:ss');
      const newEndTime = moment(end).format('HH:mm:ss');
      const newDuration = moment(end).diff(moment(start), 'minutes');

      // Update in Supabase
      const { error } = await supabase
        .from("appointments")
        .update({
          start_time: newStartTime,
          end_time: newEndTime,
          duration: newDuration,
          updated_at: new Date().toISOString()
        })
        .eq("id", event.id);

      if (error) {
        console.error('Error resizing appointment:', error);
        // Revert local changes on error
        setEvents(events);
        toast({
          title: "Error",
          description: "Failed to update appointment duration",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Appointment duration updated successfully",
        });
      }
    } catch (error) {
      console.error('Error resizing event:', error);
      // Revert local changes on error
      setEvents(events);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  // Handle event click
  const handleSelectEvent = (event: CalendarEvent) => {
    if (onAppointmentClick) {
      onAppointmentClick(event.resource.appointment);
    }
  };

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.status;
    let backgroundColor = '#3174ad';
    
    switch (status) {
      case 'Confirmed':
        backgroundColor = '#28a745';
        break;
      case 'In Progress':
        backgroundColor = '#6f42c1';
        break;
      case 'Completed':
        backgroundColor = '#6c757d';
        break;
      case 'Cancelled':
        backgroundColor = '#dc3545';
        break;
      case 'No Show':
        backgroundColor = '#fd7e14';
        break;
      default:
        backgroundColor = '#007bff';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchEvents();

    if (!user) return;

    // Supabase Realtime subscription
    const channel = supabase
      .channel('appointment-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: `salon_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Appointment change detected:', payload);
          fetchEvents(); // Refresh events when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[80vh] bg-white rounded-lg shadow-sm border">
      <DnDCalendar
        defaultView={Views.WEEK}
        views={[Views.WEEK, Views.DAY, Views.MONTH]}
        events={events}
        localizer={localizer}
        onEventDrop={moveEvent}
        onEventResize={resizeEvent}
        onSelectEvent={handleSelectEvent}
        resizable
        eventPropGetter={eventStyleGetter}
        style={{ height: "100%" }}
        popup
        showMultiDayTimes
        step={15}
        timeslots={4}
        min={moment().hour(8).minute(0).toDate()}
        max={moment().hour(20).minute(0).toDate()}
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => 
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
        }}
      />
    </div>
  );
};

export default DragDropCalendar;
