
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
  "Haircut & Style": "#8b5cf6",
  "Hair Coloring": "#a855f7", 
  "Manicure": "#c084fc",
  "Pedicure": "#d8b4fe",
  "Facial": "#7c3aed",
  "Massage": "#9333ea",
  "Beard Trim": "#8b5cf6",
  "Eyebrow": "#a855f7",
};

const statusColors = {
  "confirmed": "#10b981",
  "in-progress": "#3b82f6", 
  "upcoming": "#f59e0b",
  "completed": "#6b7280",
  "cancelled": "#ef4444",
};

// Enhanced Appointment Block Component
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

  const bgColor = serviceColors[appointment.service as keyof typeof serviceColors] || '#8b5cf6';

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.6 : 1,
    borderLeftColor: bgColor,
    minHeight: `${Math.max(appointment.duration / 15 * 16, 56)}px`
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      {...listeners}
      className={`fresha-appointment cursor-grab active:cursor-grabbing absolute inset-x-2 z-10 ${isDragging ? 'z-50' : ''}`}
    >
      <div className="fresha-appointment-content">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="fresha-time">
            {appointment.startTime} - {appointment.endTime}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-gray-600" />
          <span className="fresha-client">{appointment.clientName}</span>
        </div>
        
        <div className="fresha-service">{appointment.service}</div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">{appointment.clientPhone}</span>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-purple-600" />
            <span className="fresha-price">{appointment.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Empty Time Slot Component
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
      className="h-16 cursor-pointer hover:bg-purple-50/50 transition-all duration-200 flex items-center justify-center group relative border-b border-gray-100/50"
      onClick={handleClick}
    >
      <Plus className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:text-purple-500" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-xs text-purple-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-purple-200">
          Click to book
        </span>
      </div>
    </div>
  );
};

// Enhanced Grid Cell Component
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
    <div className="relative h-16 border-b border-gray-100/30">
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

// Main Unified Scheduler Component with dynamic grid
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

  // Create dynamic grid template
  const gridTemplate = `220px repeat(${staff.length}, 1fr)`;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="fresha-grid fresha-fade-in w-full">
        {/* Professional Header */}
        <div 
          className="fresha-header grid"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="fresha-time-column p-6">
            <h3 className="font-semibold text-gray-800 text-lg">
              Time
            </h3>
          </div>
          {staff.map((staffMember, index) => (
            <div 
              key={staffMember.id} 
              className={`p-6 border-r border-gray-200/40 last:border-r-0 ${
                index % 2 === 0 ? 'bg-white/60' : 'bg-purple-50/40'
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={staffMember.image}
                  alt={staffMember.name}
                  className="w-14 h-14 rounded-full border-3 border-purple-200/60 shadow-md"
                />
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {staffMember.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {staffMember.rating}⭐ • {staffMember.efficiency}% efficiency
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {staffMember.specialties.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Time Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map(timeSlot => (
            <div 
              key={timeSlot.time} 
              className="grid hover:bg-purple-50/20 transition-colors duration-150"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {/* Time Label */}
              <div className="fresha-time-column p-4 flex items-center border-r border-gray-200/40">
                <span className="text-base font-medium text-gray-700">
                  {timeSlot.time}
                </span>
              </div>
              
              {/* Staff Columns */}
              {staff.map((staffMember, index) => (
                <div 
                  key={`${staffMember.id}-${timeSlot.time}`}
                  className={`fresha-staff-column border-r border-gray-200/30 last:border-r-0 ${
                    index % 2 === 0 ? 'bg-white/30' : 'bg-purple-50/20'
                  }`}
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
          <div className="fresha-scale">
            <AppointmentBlock appointment={draggedAppointment} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default UnifiedScheduler;
