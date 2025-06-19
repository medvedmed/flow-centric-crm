import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Appointment {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientPhone: string;
  service: string;
  price: number;
  status: string;
  duration: number;
}

interface Staff {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  workingHours: { start: string; end: string };
  efficiency: number;
  rating: number;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface BookingSlot {
  staffId: string;
  time: string;
  staffName: string;
}

const serviceColors = {
  "Haircut & Style": "#10b981",
  "Hair Coloring": "#8b5cf6",
  "Manicure": "#f59e0b",
  "Pedicure": "#ef4444",
  "Facial": "#06b6d4",
  "Massage": "#ec4899",
  "Beard Trim": "#059669",
  "Eyebrow": "#7c3aed",
};

const statusColors = {
  "confirmed": "#10b981",
  "in-progress": "#3b82f6",
  "upcoming": "#f59e0b",
  "completed": "#6b7280",
  "cancelled": "#ef4444",
};

// Draggable Appointment Block Component
const AppointmentBlock: React.FC<{
  appointment: Appointment;
  isDragging?: boolean;
}> = ({ appointment, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: appointment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const bgColor = serviceColors[appointment.service as keyof typeof serviceColors] || 
                  statusColors[appointment.status as keyof typeof statusColors] || '#10b981';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing absolute inset-x-2 z-10 ${isDragging ? 'z-50' : ''}`}
    >
      <Card 
        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full"
        style={{ 
          backgroundColor: bgColor,
          borderLeft: `4px solid ${bgColor}`,
          minHeight: `${Math.max(appointment.duration / 15 * 20, 60)}px`
        }}
      >
        <CardContent className="p-3 text-white h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">{appointment.clientName}</span>
            </div>
            <div className="text-sm opacity-90">{appointment.service}</div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs opacity-75">{appointment.clientPhone}</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold text-sm">{appointment.price}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Empty Time Slot Component
const EmptyTimeSlot: React.FC<{
  staffId: string;
  staffName: string;
  time: string;
  onBookSlot: (slot: BookingSlot) => void;
}> = ({ staffId, staffName, time, onBookSlot }) => {
  const handleClick = () => {
    onBookSlot({ staffId, time, staffName });
  };

  return (
    <div 
      className="h-20 cursor-pointer hover:bg-teal-50 transition-colors duration-200 flex items-center justify-center group relative"
      onClick={handleClick}
    >
      <Plus className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded shadow-md border">Click to book</span>
      </div>
    </div>
  );
};

// Grid Cell Component
const GridCell: React.FC<{
  timeSlot: TimeSlot;
  staff: Staff;
  appointments: Appointment[];
  onBookSlot: (slot: BookingSlot) => void;
}> = ({ timeSlot, staff, appointments, onBookSlot }) => {
  const cellAppointments = appointments.filter(apt => 
    apt.staffId === staff.id && apt.startTime === timeSlot.time
  );

  return (
    <div className="relative h-20 border-b border-gray-100">
      <SortableContext items={cellAppointments.map(apt => apt.id)} strategy={verticalListSortingStrategy}>
        {cellAppointments.length > 0 ? (
          cellAppointments.map(appointment => (
            <AppointmentBlock key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <EmptyTimeSlot 
            staffId={staff.id} 
            staffName={staff.name}
            time={timeSlot.time} 
            onBookSlot={onBookSlot} 
          />
        )}
      </SortableContext>
    </div>
  );
};

// Main Unified Scheduler Component
interface UnifiedSchedulerProps {
  staff: Staff[];
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  onAppointmentMove: (appointmentId: string, newStaffId: string, newTime: string) => void;
  onBookSlot: (slot: BookingSlot) => void;
}

const UnifiedScheduler: React.FC<UnifiedSchedulerProps> = ({
  staff,
  appointments,
  timeSlots,
  onAppointmentMove,
  onBookSlot,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const appointment = appointments.find(apt => apt.id === active.id);
    setDraggedAppointment(appointment || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedAppointment) {
      setActiveId(null);
      setDraggedAppointment(null);
      return;
    }

    const overId = over.id as string;
    
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

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        {/* Header with Staff Names - Updated for wider layout and removed borders */}
        <div className="grid grid-cols-[150px_1fr_1fr] bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-gray-200">
          <div className="p-6 border-r border-gray-200">
            <h3 className="font-semibold text-gray-800 text-lg">Time</h3>
          </div>
          {staff.map((staffMember, index) => (
            <div 
              key={staffMember.id} 
              className="p-6"
              style={{ backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(20,184,166,0.05)' }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={staffMember.image}
                  alt={staffMember.name}
                  className="w-12 h-12 rounded-full border-2 border-teal-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{staffMember.name}</h3>
                  <p className="text-sm text-gray-600">{staffMember.rating}⭐ • {staffMember.efficiency}% • {staffMember.specialties.join(", ")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid - Updated for wider layout and removed borders */}
        <div className="max-h-[700px] overflow-y-auto">
          {timeSlots.map(timeSlot => (
            <div 
              key={timeSlot.time} 
              className="grid grid-cols-[150px_1fr_1fr] hover:bg-gray-50/50 transition-colors duration-150"
            >
              {/* Time Label */}
              <div className="p-4 border-r border-gray-200 bg-gray-50/50 flex items-center">
                <span className="text-base font-medium text-gray-700">{timeSlot.time}</span>
              </div>
              
              {/* Staff Columns - Removed visible borders between columns */}
              {staff.map((staffMember, index) => (
                <div 
                  key={`${staffMember.id}-${timeSlot.time}`}
                  style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(20,184,166,0.02)' }}
                >
                  <GridCell
                    timeSlot={timeSlot}
                    staff={staffMember}
                    appointments={appointments}
                    onBookSlot={onBookSlot}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeId && draggedAppointment ? (
          <AppointmentBlock appointment={draggedAppointment} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default UnifiedScheduler;
