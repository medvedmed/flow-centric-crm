
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

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  color: string;
  paymentStatus?: string;
  clientName?: string;
  service?: string;
  price?: number;
}

interface CalendarResource {
  resourceId: string;
  resourceTitle: string;
}

const DragDropCalendar = ({ onAppointmentClick, onTimeSlotClick }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<CalendarResource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch staff
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id, name")
        .eq("salon_id", user.id);
      if (staffError) throw staffError;

      // Fetch appointments
      const { data: appointments, error: aptError } = await supabase
        .from("appointments")
        .select("*")
        .eq("salon_id", user.id);
      if (aptError) throw aptError;

      // Format appointments with payment status styling
      const formattedEvents: CalendarEvent[] = appointments.map((apt) => {
        let color = "#007bff"; // Default blue
        
        // Color coding based on payment status
        if (apt.payment_status === 'paid') {
          color = "#28a745"; // Green for paid
        } else if (apt.payment_status === 'partial') {
          color = "#ffc107"; // Yellow for partial
        } else if (apt.payment_status === 'unpaid') {
          color = "#dc3545"; // Red for unpaid
        }

        // Add status indicator to title
        const statusIndicator = apt.payment_status === 'paid' ? '💰' : 
                              apt.payment_status === 'partial' ? '⚠️' : '❌';

        return {
          id: apt.id,
          title: `${statusIndicator} ${apt.client_name} - ${apt.service}`,
          start: moment(`${apt.date} ${apt.start_time}`).toDate(),
          end: moment(`${apt.date} ${apt.end_time}`).toDate(),
          resourceId: apt.staff_id || "unassigned",
          color: color,
          paymentStatus: apt.payment_status,
          clientName: apt.client_name,
          service: apt.service,
          price: apt.price
        };
      });

      // Map staff as resources
      const formattedResources: CalendarResource[] = staffData.map((staff) => ({
        resourceId: staff.id,
        resourceTitle: staff.name,
      }));

      setEvents(formattedEvents);
      setResources(formattedResources);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      toast({
        title: "Error",
        description: "Could not load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateAppointment = async ({ event, start, end, resourceId }) => {
    try {
      const updated = events.map((ev) =>
        ev.id === event.id ? { ...ev, start, end, resourceId } : ev
      );
      setEvents(updated);

      const { error } = await supabase
        .from("appointments")
        .update({
          date: moment(start).format("YYYY-MM-DD"),
          start_time: moment(start).format("HH:mm:ss"),
          end_time: moment(end).format("HH:mm:ss"),
          staff_id: resourceId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment moved successfully",
      });

      // Refresh calendar data
      await fetchEvents();
    } catch (err) {
      console.error("Error updating appointment:", err);
      toast({
        title: "Error",
        description: "Could not update appointment",
        variant: "destructive",
      });
      // Revert the optimistic update
      await fetchEvents();
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    onAppointmentClick?.(event);
  };

  const handleSelectSlot = (slotInfo: any) => {
    if (onTimeSlotClick) {
      onTimeSlotClick({
        date: slotInfo.start,
        time: moment(slotInfo.start).format('HH:mm'),
        staffId: slotInfo.resourceId
      });
    }
  };

  // Real-time subscription for appointment updates
  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('calendar-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Appointment change detected:', payload);
          // Refresh calendar when appointments change
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <span className="ml-2">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="h-[80vh] bg-white rounded-xl shadow border">
      <DnDCalendar
        defaultView={Views.DAY}
        views={[Views.DAY, Views.WEEK]}
        events={events}
        localizer={localizer}
        resizable
        resources={resources}
        resourceIdAccessor={(resource: CalendarResource) => resource.resourceId}
        resourceTitleAccessor={(resource: CalendarResource) => resource.resourceTitle}
        onEventDrop={updateAppointment}
        onEventResize={updateAppointment}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable={true}
        eventPropGetter={(event: CalendarEvent) => ({
          style: {
            backgroundColor: event.color || "#007bff",
            color: "white",
            borderRadius: "5px",
            border: `2px solid ${event.paymentStatus === 'paid' ? '#155724' : 
                                  event.paymentStatus === 'partial' ? '#856404' : '#721c24'}`,
            fontWeight: '500',
            fontSize: '12px'
          },
        })}
        components={{
          event: (props: any) => {
            const event = props.event as CalendarEvent;
            return (
              <div className="flex flex-col p-1">
                <div className="font-medium truncate">{event.clientName}</div>
                <div className="text-xs opacity-90 truncate">{event.service}</div>
                {event.price && <div className="text-xs opacity-75">${event.price}</div>}
              </div>
            );
          }
        }}
        style={{ height: "100%" }}
        timeslots={4}
        step={15}
        min={moment().hour(8).minute(0).toDate()}
        max={moment().hour(20).minute(0).toDate()}
      />
      
      {/* Payment Status Legend */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-700"></div>
          <span className="text-sm">💰 Paid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded border-2 border-yellow-700"></div>
          <span className="text-sm">⚠️ Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-700"></div>
          <span className="text-sm">❌ Unpaid</span>
        </div>
      </div>
    </div>
  );
};

export default DragDropCalendar;
