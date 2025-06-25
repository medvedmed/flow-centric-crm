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

const DragDropCalendar = ({ onAppointmentClick }) => {
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
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

      // Format appointments
      const formattedEvents = appointments.map((apt) => ({
        id: apt.id,
        title: `${apt.client_name} - ${apt.service}`,
        start: moment(`${apt.date} ${apt.start_time}`).toDate(),
        end: moment(`${apt.date} ${apt.end_time}`).toDate(),
        resourceId: apt.staff_id || "unassigned",
      }));

      // Map staff to resources
      const formattedResources = staffData.map((staff) => ({
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

      const { error } = await supabase.from("appointments").update({
        date: moment(start).format("YYYY-MM-DD"),
        start_time: moment(start).format("HH:mm:ss"),
        end_time: moment(end).format("HH:mm:ss"),
        staff_id: resourceId,
        updated_at: new Date().toISOString(),
      }).eq("id", event.id);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating appointment:", err);
      toast({
        title: "Error",
        description: "Could not update appointment",
        variant: "destructive",
      });
    }
  };

  const handleSelectEvent = (event) => {
    onAppointmentClick?.(event);
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return <div className="text-center py-8">Loading calendar...</div>;
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
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        onEventDrop={updateAppointment}
        onEventResize={updateAppointment}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={() => ({
          style: {
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "5px",
          },
        })}
        style={{ height: "100%" }}
        timeslots={4}
        step={15}
        min={moment().hour(8).minute(0).toDate()}
        max={moment().hour(20).minute(0).toDate()}
      />
    </div>
  );
};

export default DragDropCalendar;
