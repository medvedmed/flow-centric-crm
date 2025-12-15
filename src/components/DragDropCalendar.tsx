
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
import { MobileOptimizedScheduler } from "./MobileOptimizedScheduler";
import { StaffWorkingHoursQuickControl } from "./appointments/StaffWorkingHoursQuickControl";

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
  workingHoursStart?: string;
  workingHoursEnd?: string;
}

const DragDropCalendar = ({ onAppointmentClick, onTimeSlotClick }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<CalendarResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch staff with working hours
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id, name, working_hours_start, working_hours_end")
        .eq("salon_id", user.id);
      if (staffError) throw staffError;

      // Fetch appointments with related data
      const { data: appointments, error: aptError } = await supabase
        .from("appointments")
        .select(`
          *,
          clients:client_id(full_name, phone),
          services:service_id(name, price)
        `)
        .eq("organization_id", user.id);
      if (aptError) throw aptError;

      // Format appointments with payment status styling
      const formattedEvents: CalendarEvent[] = (appointments || []).map((apt: any) => {
        let color = apt.color || "#007bff"; // Use stored color or default blue
        
        // Extract related data
        const clientName = apt.clients?.full_name || 'Unknown Client';
        const serviceName = apt.services?.name || 'Service';
        const servicePrice = apt.services?.price || 0;
        
        // Extract date and time from start_time timestamp
        const startDate = new Date(apt.start_time);
        const endDate = new Date(apt.end_time);

        return {
          id: apt.id,
          title: `${clientName} - ${serviceName}`,
          start: startDate,
          end: endDate,
          resourceId: apt.staff_id || "unassigned",
          color: color,
          paymentStatus: apt.status === 'Completed' ? 'paid' : 'unpaid',
          clientName: clientName,
          service: serviceName,
          price: servicePrice
        };
      });

      // Map staff as resources with working hours
      const formattedResources: CalendarResource[] = staffData.map((staff) => ({
        resourceId: staff.id,
        resourceTitle: staff.name,
        workingHoursStart: staff.working_hours_start || '09:00',
        workingHoursEnd: staff.working_hours_end || '17:00'
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
    // Check if the new time slot is within staff working hours
    const staff = resources.find(r => r.resourceId === resourceId);
    if (staff) {
      const startTime = moment(start).format('HH:mm');
      const endTime = moment(end).format('HH:mm');
      
      if (startTime < staff.workingHoursStart || endTime > staff.workingHoursEnd) {
        toast({
          title: "Invalid Time Slot",
          description: `This appointment cannot be scheduled outside ${staff.resourceTitle}'s working hours (${staff.workingHoursStart} - ${staff.workingHoursEnd})`,
          variant: "destructive",
        });
        // Refresh to revert the optimistic update
        await fetchEvents();
        return;
      }
    }

    try {
      const updated = events.map((ev) =>
        ev.id === event.id ? { ...ev, start, end, resourceId } : ev
      );
      setEvents(updated);

      const { error } = await supabase
        .from("appointments")
        .update({
          start_time: moment(start).toISOString(),
          end_time: moment(end).toISOString(),
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
    // Check if the selected slot is within staff working hours
    const staff = resources.find(r => r.resourceId === slotInfo.resourceId);
    if (staff) {
      const slotTime = moment(slotInfo.start).format('HH:mm');
      
      if (slotTime < staff.workingHoursStart || slotTime >= staff.workingHoursEnd) {
        toast({
          title: "Outside Working Hours",
          description: `${staff.resourceTitle} is not available at this time. Working hours: ${staff.workingHoursStart} - ${staff.workingHoursEnd}`,
          variant: "destructive",
        });
        return;
      }
    }

    if (onTimeSlotClick) {
      onTimeSlotClick({
        date: slotInfo.start,
        time: moment(slotInfo.start).format('HH:mm'),
        staffId: slotInfo.resourceId
      });
    }
  };

  // Handle staff name click for working hours management
  const handleResourceClick = (resourceId: string) => {
    const staff = resources.find(r => r.resourceId === resourceId);
    if (staff) {
      setSelectedStaff({
        id: resourceId,
        name: staff.resourceTitle,
        startTime: staff.workingHoursStart || '09:00',
        endTime: staff.workingHoursEnd || '17:00'
      });
    }
  };

  // Custom resource header component with click handler
  const ResourceHeader = ({ resource }: { resource: CalendarResource }) => (
    <div 
      className="cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
      onClick={() => handleResourceClick(resource.resourceId)}
      title="Click to manage working hours"
    >
      <div className="font-medium">{resource.resourceTitle}</div>
      <div className="text-xs text-gray-500">
        {resource.workingHoursStart} - {resource.workingHoursEnd}
      </div>
    </div>
  );

  // Custom slot prop getter to show working hours visually
  const slotPropGetter = useCallback((date: Date, resourceId?: string) => {
    if (!resourceId) return {};
    
    const staff = resources.find(r => r.resourceId === resourceId);
    if (!staff) return {};
    
    const slotTime = moment(date).format('HH:mm');
    const isOutsideWorkingHours = slotTime < staff.workingHoursStart || slotTime >= staff.workingHoursEnd;
    
    if (isOutsideWorkingHours) {
      return {
        style: {
          backgroundColor: '#f3f4f6',
          opacity: 0.5,
          pointerEvents: 'none' as const
        }
      };
    }
    
    return {};
  }, [resources]);

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
          fetchEvents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff'
        },
        (payload) => {
          console.log('Staff change detected:', payload);
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
    <>
      <div className="h-[80vh] bg-white rounded-xl shadow border">
        {/* Show mobile-optimized view on small screens */}
        <div className="block md:hidden">
          <MobileOptimizedScheduler 
            onAppointmentClick={onAppointmentClick}
            onTimeSlotClick={onTimeSlotClick}
          />
        </div>

        {/* Show full calendar on larger screens */}
        <div className="hidden md:block h-full">
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
            slotPropGetter={slotPropGetter}
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
              },
              resourceHeader: ({ resource }: { resource: any }) => (
                <ResourceHeader resource={resource} />
              )
            }}
            style={{ height: "100%" }}
            timeslots={4}
            step={15}
            min={moment().hour(8).minute(0).toDate()}
            max={moment().hour(20).minute(0).toDate()}
          />
        </div>
        
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
          <div className="flex items-center gap-2 ml-4">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-sm">Outside Working Hours</span>
          </div>
        </div>
      </div>

      {/* Staff Working Hours Quick Control Dialog */}
      {selectedStaff && (
        <StaffWorkingHoursQuickControl
          staffId={selectedStaff.id}
          staffName={selectedStaff.name}
          currentStartTime={selectedStaff.startTime}
          currentEndTime={selectedStaff.endTime}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </>
  );
};

export default DragDropCalendar;
