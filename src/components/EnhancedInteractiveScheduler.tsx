
import React, { useState, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Plus, Calendar } from 'lucide-react';
import { Appointment, Staff } from '@/services/types';
import { format } from 'date-fns';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { useAppointmentOperations } from '@/hooks/useAppointmentOperations';

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

// Enhanced Empty Time Slot Component with proper drop zone
const EmptyTimeSlot: React.FC<{
  staffId: string;
  staffName: string;
  time: string;
  onBookSlot: (slot: BookingSlot) => void;
}> = ({ staffId, staffName, time, onBookSlot }) => {
  
  const dropId = `${staffId}-${time}`;
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      type: 'time-slot',
      staffId,
      time,
      staffName
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Booking slot clicked: ${staffName} at ${time}`);
    onBookSlot({ staffId, time, staffName });
  };

  return (
    <div 
      ref={setNodeRef}
      className={`h-16 cursor-pointer transition-all duration-200 flex items-center justify-center group relative border-b border-gray-100/50 ${
        isOver ? 'bg-blue-100 border-blue-300' : 'hover:bg-blue-50/80'
      }`}
      onClick={handleClick}
    >
      <Plus className={`w-5 h-5 transition-all duration-200 ${
        isOver ? 'text-blue-600 scale-125' : 'text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 group-hover:scale-110'
      }`} />
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
        isOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <span className="text-xs text-blue-600 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm border border-blue-200">
          {isOver ? 'Drop here' : `Click to book at ${time}`}
        </span>
      </div>
    </div>
  );
};

// Enhanced Appointment Block Component with proper dragging
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
  } = useSortable({ 
    id: appointment.id,
    data: {
      type: 'appointment',
      appointment
    }
  });

  const bgColor = serviceColors[appointment.service as keyof typeof serviceColors] || '#3b82f6';

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.6 : 1,
    borderLeftColor: bgColor,
    minHeight: `${Math.max((appointment.duration || 60) / 15 * 16, 56)}px`
  };

  console.log('Rendering appointment:', appointment.clientName, 'at', appointment.startTime);

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      {...listeners}
      className={`absolute inset-x-2 z-10 cursor-grab active:cursor-grabbing ${isDragging ? 'z-50' : ''}`}
    >
      <Card className="h-full border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: bgColor }}>
        <CardContent className="p-3 h-full">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span className="font-medium">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-gray-600" />
              <span className="font-semibold text-gray-800 text-sm">{appointment.clientName}</span>
            </div>
            
            <div className="text-xs font-medium text-blue-600 truncate">{appointment.service}</div>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{appointment.clientPhone || 'No phone'}</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-600">${appointment.price || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Grid Cell Component with proper drop zones
const GridCell: React.FC<{
  timeSlot: TimeSlot;
  staff: Staff;
  appointments: Appointment[];
  onBookSlot: (slot: BookingSlot) => void;
}> = ({ timeSlot, staff, appointments, onBookSlot }) => {
  // Fix the appointment filtering with better time matching
  const cellAppointments = appointments.filter(apt => {
    const isMatchingStaff = apt.staffId === staff.id;
    const appointmentTime = apt.startTime;
    
    // More flexible time matching
    const isMatchingTime = appointmentTime === timeSlot.time || 
                          (appointmentTime && appointmentTime.substring(0, 5) === timeSlot.time) ||
                          (appointmentTime && appointmentTime === timeSlot.time + ':00');
    
    console.log(`Checking appointment for ${staff.name} at ${timeSlot.time}:`, {
      appointmentId: apt.id,
      appointmentTime,
      isMatchingStaff,
      isMatchingTime,
      clientName: apt.clientName
    });
    
    return isMatchingStaff && isMatchingTime;
  });

  console.log(`Grid cell for ${staff.name} at ${timeSlot.time}: ${cellAppointments.length} appointments`);

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

// Mobile-friendly staff header component
const StaffHeader: React.FC<{ staffMember: Staff; index: number }> = ({ staffMember, index }) => (
  <div 
    className={`p-2 md:p-4 border-r border-gray-200 last:border-r-0 ${
      index % 2 === 0 ? 'bg-white/80' : 'bg-blue-50/40'
    }`}
  >
    <div className="flex items-center gap-2 md:gap-3">
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <span className="text-blue-600 font-semibold text-xs md:text-sm">
          {staffMember.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base truncate">
          {staffMember.name}
        </h3>
        <p className="text-xs text-gray-600 truncate">
          {staffMember.specialties?.slice(0, 2).join(", ") || "All Services"}
        </p>
      </div>
    </div>
  </div>
);

interface EnhancedInteractiveSchedulerProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentUpdate?: () => void;
}

const EnhancedInteractiveScheduler: React.FC<EnhancedInteractiveSchedulerProps> = ({
  staff,
  appointments,
  selectedDate,
  onAppointmentUpdate
}) => {
  console.log('EnhancedInteractiveScheduler rendering with:', {
    staffCount: staff.length,
    appointmentCount: appointments.length,
    selectedDate: format(selectedDate, 'yyyy-MM-dd'),
    appointments: appointments.map(apt => ({
      id: apt.id,
      clientName: apt.clientName,
      startTime: apt.startTime,
      staffId: apt.staffId
    }))
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<BookingSlot | null>(null);

  const { moveAppointment, isMoving } = useAppointmentOperations();

  // Generate time slots from 8 AM to 6 PM
  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          hour,
          minute
        });
      }
    }
    return slots;
  }, []);

  const handleBookSlot = useCallback((slot: BookingSlot) => {
    console.log('Book slot clicked:', slot);
    setSelectedBookingSlot(slot);
    setIsAddAppointmentOpen(true);
  }, []);

  const handleAppointmentSuccess = useCallback(() => {
    console.log('Appointment successfully created/updated');
    setIsAddAppointmentOpen(false);
    setSelectedBookingSlot(null);
    onAppointmentUpdate?.();
  }, [onAppointmentUpdate]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const appointment = appointments.find(apt => apt.id === active.id);
    setDraggedAppointment(appointment || null);
    console.log('Drag started:', appointment?.clientName);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
    console.log('Drag over:', event.over?.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag end:', { activeId: active.id, overId: over?.id });
    
    if (!over || !draggedAppointment) {
      setActiveId(null);
      setDraggedAppointment(null);
      return;
    }

    const overId = over.id as string;
    
    // Check if dropped on a time slot (format: staffId-time)
    if (overId.includes('-') && overId !== active.id) {
      const [newStaffId, newTime] = overId.split('-');
      
      console.log('Moving appointment to:', { newStaffId, newTime });
      
      moveAppointment({
        appointmentId: active.id as string,
        newStaffId,
        newTime,
        duration: draggedAppointment.duration || 60
      });
    }

    setActiveId(null);
    setDraggedAppointment(null);
  };

  // Responsive grid template
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const gridTemplate = isMobile 
    ? `120px repeat(${Math.min(staff.length, 2)}, 1fr)` 
    : `220px repeat(${staff.length}, 1fr)`;

  if (staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Available</h3>
          <p className="text-gray-500">Add staff members to start scheduling appointments.</p>
        </div>
      </div>
    );
  }

  // Show only first 2 staff on mobile, all on desktop
  const displayStaff = isMobile ? staff.slice(0, 2) : staff;

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full bg-white rounded-lg shadow-sm border">
          {/* Professional Header */}
          <div 
            className="grid border-b bg-gray-50/50 overflow-x-auto"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="p-2 md:p-4 border-r border-gray-200 flex-shrink-0">
              <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                Time
              </h3>
            </div>
            {displayStaff.map((staffMember, index) => (
              <StaffHeader key={staffMember.id} staffMember={staffMember} index={index} />
            ))}
          </div>

          {/* Professional Time Grid */}
          <div className="max-h-[600px] overflow-y-auto">
            {timeSlots.map(timeSlot => (
              <div 
                key={timeSlot.time} 
                className="grid hover:bg-blue-50/20 transition-colors duration-150"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {/* Time Label */}
                <div className="p-2 md:p-4 flex items-center border-r border-gray-200/50 bg-gray-50/30 flex-shrink-0">
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    {timeSlot.time}
                  </span>
                </div>
                
                {/* Staff Columns */}
                {displayStaff.map((staffMember, index) => (
                  <div 
                    key={`${staffMember.id}-${timeSlot.time}`}
                    className={`border-r border-gray-200/30 last:border-r-0 ${
                      index % 2 === 0 ? 'bg-white/50' : 'bg-blue-50/20'
                    }`}
                  >
                    <GridCell
                      timeSlot={timeSlot}
                      staff={staffMember}
                      appointments={appointments}
                      onBookSlot={handleBookSlot}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId && draggedAppointment ? (
            <div className="transform scale-105">
              <AppointmentBlock appointment={draggedAppointment} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Mobile staff pagination hint */}
      {isMobile && staff.length > 2 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Showing {displayStaff.length} of {staff.length} staff members. 
            <br />
            <span className="text-xs">View on desktop for full schedule</span>
          </p>
        </div>
      )}

      {/* Add Appointment Dialog */}
      <AddAppointmentDialog 
        open={isAddAppointmentOpen}
        onOpenChange={(open) => {
          console.log('Dialog open state changed:', open);
          setIsAddAppointmentOpen(open);
          if (!open) {
            setSelectedBookingSlot(null);
          }
        }}
        selectedDate={selectedDate}
        selectedTime={selectedBookingSlot?.time}
        selectedStaffId={selectedBookingSlot?.staffId}
        onSuccess={handleAppointmentSuccess}
      />
    </>
  );
};

export default EnhancedInteractiveScheduler;
