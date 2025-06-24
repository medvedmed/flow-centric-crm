
import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, DollarSign, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { InteractiveAppointmentCard } from './InteractiveAppointmentCard';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface EnhancedInteractiveSchedulerProps {
  staff: any[];
  appointments: any[];
  selectedDate: Date;
  onAppointmentUpdate?: () => void;
}

// Draggable Appointment Component
const DraggableAppointmentBlock: React.FC<{
  appointment: any;
  isDragging?: boolean;
}> = ({ appointment, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: appointment.id,
    data: {
      type: 'appointment',
      appointment
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const getStatusColor = () => {
    if (appointment.payment_status === 'paid') return 'bg-green-500 hover:bg-green-600';
    
    switch (appointment.status) {
      case 'Cancelled': return 'bg-red-500 hover:bg-red-600';
      case 'In Progress': return 'bg-blue-500 hover:bg-blue-600';
      case 'Completed': return 'bg-green-500 hover:bg-green-600';
      case 'No Show': return 'bg-orange-500 hover:bg-orange-600';
      default: return 'bg-purple-500 hover:bg-purple-600';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 rounded-md text-white text-xs cursor-grab active:cursor-grabbing mb-1 ${getStatusColor()}`}
    >
      <div className="font-medium truncate">{appointment.client_name}</div>
      <div className="opacity-90 truncate">{appointment.service}</div>
      <div className="opacity-75">{appointment.start_time} - {appointment.end_time}</div>
      <div className="font-medium">${appointment.price}</div>
    </div>
  );
};

// Droppable Time Slot Component
const DroppableTimeSlot: React.FC<{
  timeSlot: TimeSlot;
  staffMember: any;
  appointments: any[];
  selectedDate: Date;
  onAppointmentUpdate?: () => void;
}> = ({ timeSlot, staffMember, appointments, selectedDate, onAppointmentUpdate }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const slotAppointments = appointments.filter(apt => 
    apt.staff_id === staffMember.id && 
    apt.start_time.substring(0, 5) === timeSlot.time &&
    apt.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const handleSlotClick = () => {
    if (slotAppointments.length === 0) {
      setShowAddDialog(true);
    }
  };

  return (
    <>
      <div 
        className="min-h-[60px] p-1 border-b border-gray-100 hover:bg-purple-50/30 transition-colors cursor-pointer relative"
        onClick={handleSlotClick}
      >
        <SortableContext 
          items={slotAppointments.map(apt => apt.id)} 
          strategy={verticalListSortingStrategy}
        >
          {slotAppointments.length > 0 ? (
            slotAppointments.map(appointment => (
              <DraggableAppointmentBlock
                key={appointment.id}
                appointment={appointment}
              />
            ))
          ) : (
            <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4 text-purple-400" />
            </div>
          )}
        </SortableContext>
      </div>

      <AddAppointmentDialog 
        selectedDate={selectedDate}
        selectedTime={timeSlot.time}
        selectedStaffId={staffMember.id}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
};

const EnhancedInteractiveScheduler: React.FC<EnhancedInteractiveSchedulerProps> = ({
  staff,
  appointments,
  selectedDate,
  onAppointmentUpdate
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate time slots from 8 AM to 8 PM
  const timeSlots: TimeSlot[] = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push({
        time: timeString,
        hour,
        minute
      });
    }
  }

  // Move appointment mutation
  const moveAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, newStaffId, newTime }: {
      appointmentId: string;
      newStaffId: string;
      newTime: string;
    }) => {
      const { error } = await supabase
        .from('appointments')
        .update({
          staff_id: newStaffId,
          start_time: newTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      if (onAppointmentUpdate) {
        onAppointmentUpdate();
      }
      toast({
        title: "Appointment Moved",
        description: "The appointment has been successfully moved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Move Failed",
        description: error.message || "Failed to move appointment",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const appointment = appointments.find(apt => apt.id === active.id);
    setDraggedAppointment(appointment);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDraggedAppointment(null);

    if (!over || !draggedAppointment) return;

    // Parse the drop target
    const overData = over.data.current;
    
    if (overData && overData.type === 'timeSlot') {
      const { staffId, time } = overData;
      
      if (staffId !== draggedAppointment.staff_id || time !== draggedAppointment.start_time) {
        moveAppointmentMutation.mutate({
          appointmentId: draggedAppointment.id,
          newStaffId: staffId,
          newTime: time
        });
      }
    }
  };

  if (staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Staff Members</h3>
          <p className="text-gray-500">Add staff members to view the schedule.</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="grid gap-0" style={{ gridTemplateColumns: `120px repeat(${staff.length}, 1fr)` }}>
            <div className="p-4 border-r bg-gray-50">
              <span className="font-medium text-gray-700">Time</span>
            </div>
            {staff.map((member) => (
              <div key={member.id} className="p-4 border-r border-gray-200 last:border-r-0 bg-gray-50">
                <div className="text-center">
                  <div className="font-medium text-gray-900 truncate">{member.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {member.specialties?.[0] || 'General'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((timeSlot) => (
            <div 
              key={timeSlot.time} 
              className="grid gap-0 hover:bg-gray-50/30 transition-colors"
              style={{ gridTemplateColumns: `120px repeat(${staff.length}, 1fr)` }}
            >
              {/* Time Column */}
              <div className="p-3 border-r bg-gray-50/50 flex items-center">
                <span className="font-medium text-gray-600">{timeSlot.time}</span>
              </div>
              
              {/* Staff Columns */}
              {staff.map((member) => (
                <DroppableTimeSlot
                  key={`${member.id}-${timeSlot.time}`}
                  timeSlot={timeSlot}
                  staffMember={member}
                  appointments={appointments}
                  selectedDate={selectedDate}
                  onAppointmentUpdate={onAppointmentUpdate}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeId && draggedAppointment ? (
          <DraggableAppointmentBlock 
            appointment={draggedAppointment} 
            isDragging 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default EnhancedInteractiveScheduler;
