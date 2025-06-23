
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

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

// Fresha-style Appointment Block Component
const AppointmentBlock: React.FC<{
  appointment: Appointment;
  isDragging?: boolean;
}> = ({ appointment, isDragging = false }) => {
  const { isRTL } = useLanguage();
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
    minHeight: `${Math.max(appointment.duration / 15 * 16, 48)}px`
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      {...listeners}
      className={`fresha-appointment cursor-grab active:cursor-grabbing absolute inset-x-1 z-10 ${isDragging ? 'z-50' : ''}`}
    >
      <div className="fresha-appointment-content">
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="fresha-time">
            {appointment.startTime} - {appointment.endTime}
          </span>
        </div>
        
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <User className="w-3 h-3 text-gray-600" />
          <span className="fresha-client">{appointment.clientName}</span>
        </div>
        
        <div className="fresha-service">{appointment.service}</div>
        
        <div className={`flex items-center justify-between mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-400">{appointment.clientPhone}</span>
          <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <DollarSign className="w-3 h-3 text-purple-600" />
            <span className="fresha-price">{appointment.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fresha-style Empty Time Slot Component
const EmptyTimeSlot: React.FC<{
  staffId: string;
  staffName: string;
  time: string;
  onBookSlot: (slot: BookingSlot) => void;
}> = ({ staffId, staffName, time, onBookSlot }) => {
  const { t, isRTL } = useLanguage();
  
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
        <span className={`text-xs text-purple-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-purple-200 ${isRTL ? 'font-arabic' : ''}`}>
          {t('click_to_book_slot')}
        </span>
      </div>
    </div>
  );
};

// Fresha-style Grid Cell Component
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

// Main Unified Scheduler Component with Fresha styling
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
  const { t, isRTL } = useLanguage();
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
      <div className="fresha-grid fresha-fade-in">
        {/* Fresha-style Header */}
        <div className={`grid grid-cols-[180px_1fr_1fr] fresha-header ${isRTL ? 'text-right' : ''}`}>
          <div className="fresha-time-column p-5">
            <h3 className={`font-semibold text-gray-800 text-base ${isRTL ? 'font-arabic' : ''}`}>
              {t('time')}
            </h3>
          </div>
          {staff.map((staffMember, index) => (
            <div 
              key={staffMember.id} 
              className={`p-5 ${index % 2 === 0 ? 'bg-white/40' : 'bg-purple-50/30'}`}
            >
              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <img
                  src={staffMember.image}
                  alt={staffMember.name}
                  className="w-11 h-11 rounded-full border-2 border-purple-200/60 shadow-sm"
                />
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className={`font-semibold text-gray-800 text-base ${isRTL ? 'font-arabic' : ''}`}>
                    {staffMember.name}
                  </h3>
                  <p className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                    {staffMember.rating}⭐ • {staffMember.efficiency}% • {staffMember.specialties.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fresha-style Time Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map(timeSlot => (
            <div 
              key={timeSlot.time} 
              className="grid grid-cols-[180px_1fr_1fr] hover:bg-purple-50/20 transition-colors duration-150"
            >
              {/* Time Label */}
              <div className={`fresha-time-column p-3 flex items-center ${isRTL ? 'justify-end' : ''}`}>
                <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'font-arabic' : ''}`}>
                  {timeSlot.time}
                </span>
              </div>
              
              {/* Staff Columns */}
              {staff.map((staffMember, index) => (
                <div 
                  key={`${staffMember.id}-${timeSlot.time}`}
                  className={`fresha-staff-column ${index % 2 === 0 ? 'bg-white/20' : 'bg-purple-50/10'}`}
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
