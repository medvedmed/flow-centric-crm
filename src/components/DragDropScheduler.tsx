
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Staff, Appointment } from '@/services/types';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

const serviceColors = {
  "Haircut & Style": { bg: "#10b981", text: "#ffffff" },
  "Hair Coloring": { bg: "#8b5cf6", text: "#ffffff" },
  "Manicure": { bg: "#f59e0b", text: "#ffffff" },
  "Pedicure": { bg: "#ef4444", text: "#ffffff" },
  "Facial": { bg: "#06b6d4", text: "#ffffff" },
  "Massage": { bg: "#ec4899", text: "#ffffff" },
  "Beard Trim": { bg: "#059669", text: "#ffffff" },
  "Eyebrow": { bg: "#7c3aed", text: "#ffffff" },
};

const statusColors = {
  "Scheduled": { bg: "#10b981", text: "#ffffff" },
  "In Progress": { bg: "#3b82f6", text: "#ffffff" },
  "Completed": { bg: "#6b7280", text: "#ffffff" },
  "Cancelled": { bg: "#ef4444", text: "#ffffff" },
  "No Show": { bg: "#f59e0b", text: "#ffffff" },
};

// Draggable Appointment Block Component
const AppointmentBlock: React.FC<{
  appointment: Appointment;
  isDragging?: boolean;
  isReadOnly?: boolean;
}> = ({ appointment, isDragging = false, isReadOnly = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: appointment.id,
    disabled: isReadOnly 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const colors = serviceColors[appointment.service as keyof typeof serviceColors] || 
                 statusColors[appointment.status as keyof typeof statusColors] || 
                 { bg: '#10b981', text: '#ffffff' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!isReadOnly ? listeners : {})}
      className={`mb-2 ${!isReadOnly ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${isDragging ? 'z-50' : ''}`}
    >
      <Card 
        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
        style={{ 
          backgroundColor: colors?.bg || '#10b981',
          borderLeft: `4px solid ${colors?.bg || '#10b981'}`,
          minHeight: `${Math.max((appointment.duration || 60) / 15 * 20, 60)}px`
        }}
      >
        <CardContent className="p-3 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: colors?.text || '#ffffff' 
              }}
            >
              {appointment.status}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              <span className="font-medium text-sm">{appointment.clientName}</span>
            </div>
            
            <div className="text-xs opacity-90">{appointment.service}</div>
            
            <div className="flex items-center justify-between mt-2">
              {appointment.clientPhone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs opacity-75">{appointment.clientPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="font-bold text-sm">${appointment.price}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Time Slot Component
const TimeSlot: React.FC<{
  timeSlot: TimeSlot;
  appointments: Appointment[];
  staffId: string;
  isReadOnly?: boolean;
}> = ({ timeSlot, appointments, staffId, isReadOnly = false }) => {
  const slotAppointments = appointments.filter(apt => 
    apt.staffId === staffId && apt.startTime === timeSlot.time
  );

  return (
    <div className="min-h-[60px] border-b border-gray-200 p-2 bg-gray-50/50">
      <div className="text-xs text-gray-500 mb-1">{timeSlot.time}</div>
      <SortableContext items={slotAppointments.map(apt => apt.id)} strategy={verticalListSortingStrategy}>
        {slotAppointments.map(appointment => (
          <AppointmentBlock 
            key={appointment.id} 
            appointment={appointment} 
            isReadOnly={isReadOnly}
          />
        ))}
      </SortableContext>
    </div>
  );
};

// Staff Column Component
const StaffColumn: React.FC<{
  staff: Staff;
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  isReadOnly?: boolean;
}> = ({ staff, timeSlots, appointments, isReadOnly = false }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-w-[280px] bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Staff Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-emerald-50">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-teal-200">
            <AvatarImage src={staff.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} />
            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white font-semibold">
              {getInitials(staff.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-800">{staff.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{staff.rating || 5.0}⭐</span>
              <span>•</span>
              <span>{staff.efficiency || 100}% efficiency</span>
            </div>
            {staff.specialties && staff.specialties.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {staff.specialties.slice(0, 2).join(', ')}
                {staff.specialties.length > 2 && '...'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {timeSlots.map(timeSlot => (
          <TimeSlot
            key={`${staff.id}-${timeSlot.time}`}
            timeSlot={timeSlot}
            appointments={appointments}
            staffId={staff.id}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
    </div>
  );
};

// Main Scheduler Component
interface DragDropSchedulerProps {
  staff: Staff[];
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  onAppointmentMove: (appointmentId: string, newStaffId: string, newTime: string) => void;
  isReadOnly?: boolean;
}

const DragDropScheduler: React.FC<DragDropSchedulerProps> = ({
  staff,
  appointments,
  timeSlots,
  onAppointmentMove,
  isReadOnly = false,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    if (isReadOnly) return;
    
    const { active } = event;
    setActiveId(active.id as string);
    
    const appointment = appointments.find(apt => apt.id === active.id);
    setDraggedAppointment(appointment || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isReadOnly) return;
    
    const { active, over } = event;
    
    if (!over || !draggedAppointment) {
      setActiveId(null);
      setDraggedAppointment(null);
      return;
    }

    // Parse the drop target to determine new staff and time
    const overId = over.id as string;
    
    // If dropped on another appointment, find its position
    if (overId !== active.id) {
      const targetAppointment = appointments.find(apt => apt.id === overId);
      if (targetAppointment) {
        onAppointmentMove(
          active.id as string,
          targetAppointment.staffId,
          targetAppointment.startTime
        );
      }
    }

    setActiveId(null);
    setDraggedAppointment(null);
  };

  if (isReadOnly) {
    // Read-only version without drag and drop
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {staff.map(staffMember => (
          <StaffColumn
            key={staffMember.id}
            staff={staffMember}
            timeSlots={timeSlots}
            appointments={appointments}
            isReadOnly={true}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {staff.map(staffMember => (
          <StaffColumn
            key={staffMember.id}
            staff={staffMember}
            timeSlots={timeSlots}
            appointments={appointments}
            isReadOnly={false}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId && draggedAppointment ? (
          <AppointmentBlock appointment={draggedAppointment} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DragDropScheduler;
