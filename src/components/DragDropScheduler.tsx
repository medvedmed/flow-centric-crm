
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Plus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Staff, Appointment } from '@/services/types';
import { AddAppointmentDialog } from './AddAppointmentDialog';
import { format } from 'date-fns';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface DragDropSchedulerProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onAppointmentMove?: (appointmentId: string, newStaffId: string, newTime: string) => void;
  onRefresh?: () => void;
}

// Utility function to normalize time format for comparison
const normalizeTime = (time: string): string => {
  if (!time) return '';
  return time.split(':').slice(0, 2).join(':');
};

// Compact Appointment Block Component
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
    opacity: isDragging || isSortableDragging ? 0.6 : 1,
  };

  const statusColors = {
    'Scheduled': 'bg-blue-50 border-l-blue-500 text-blue-900',
    'Confirmed': 'bg-green-50 border-l-green-500 text-green-900', 
    'In Progress': 'bg-purple-50 border-l-purple-500 text-purple-900',
    'Completed': 'bg-gray-50 border-l-gray-500 text-gray-900',
    'Cancelled': 'bg-red-50 border-l-red-500 text-red-900',
    'No Show': 'bg-orange-50 border-l-orange-500 text-orange-900'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing w-full rounded-md border-l-4 p-2 mb-1 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        statusColors[appointment.status as keyof typeof statusColors] || statusColors.Scheduled
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div className="space-y-1 overflow-hidden">
        {/* Time and Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs font-semibold truncate">
              {normalizeTime(appointment.startTime)}-{normalizeTime(appointment.endTime)}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs px-1 py-0 flex-shrink-0">
            {appointment.status}
          </Badge>
        </div>
        
        {/* Client Name */}
        <div className="flex items-center gap-1 min-w-0">
          <User className="w-3 h-3 text-gray-600 flex-shrink-0" />
          <p className="font-medium text-sm truncate">{appointment.clientName}</p>
        </div>
        
        {/* Service and Price Row */}
        <div className="flex items-center justify-between min-w-0">
          <p className="text-xs text-gray-700 truncate flex-1">{appointment.service}</p>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-xs font-medium text-green-600">${appointment.price}</span>
          </div>
        </div>

        {/* Phone if available */}
        {appointment.clientPhone && (
          <div className="flex items-center gap-1 min-w-0">
            <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">{appointment.clientPhone}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Empty Time Slot Component
const EmptyTimeSlot: React.FC<{
  staffId: string;
  time: string;
  selectedDate: Date;
}> = ({ staffId, time, selectedDate }) => {
  return (
    <div className="h-16 w-full flex items-center justify-center hover:bg-gray-50/50 transition-colors rounded">
      <AddAppointmentDialog
        selectedDate={selectedDate}
        selectedTime={time}
        selectedStaffId={staffId}
        trigger={
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-200/60">
            <Plus className="w-3 h-3 text-gray-400" />
          </Button>
        }
      />
    </div>
  );
};

const DragDropScheduler: React.FC<DragDropSchedulerProps> = ({
  staff,
  appointments,
  selectedDate,
  onAppointmentMove,
  onRefresh
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);

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

    // Handle drop logic here
    if (onAppointmentMove) {
      const dropData = (over.data?.current as any) || {};
      if (dropData.staffId && dropData.time) {
        onAppointmentMove(active.id as string, dropData.staffId, dropData.time);
      }
    }

    setActiveId(null);
    setDraggedAppointment(null);
  };

  const getAppointmentsForStaffAndTime = (staffId: string, time: string) => {
    const normalizedTime = normalizeTime(time);
    return appointments.filter(apt => {
      const normalizedStartTime = normalizeTime(apt.startTime);
      return apt.staffId === staffId && normalizedStartTime === normalizedTime;
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (staff.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Staff Available</h3>
        <p className="text-gray-600 text-center mb-4">
          Add staff members to start scheduling appointments.
        </p>
        <Button onClick={onRefresh} variant="outline">
          Refresh Data
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-full bg-white overflow-hidden flex flex-col">
        {/* Schedule Header with Date */}
        <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-gray-300">
          <div className="flex items-center justify-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </h2>
          </div>
        </div>

        {/* Sticky Staff Header */}
        <div 
          className="sticky top-0 z-10 bg-white border-b-2 border-gray-400 shadow-sm flex-shrink-0"
          style={{ 
            display: 'grid',
            gridTemplateColumns: `120px repeat(${staff.length}, 1fr)` 
          }}
        >
          {/* Time Column Header */}
          <div className="p-3 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center">
            <span className="font-bold text-gray-800 text-sm">TIME</span>
          </div>
          
          {/* Staff Headers */}
          {staff.map((staffMember) => (
            <div 
              key={staffMember.id} 
              className="p-2 border-r-2 border-gray-400 last:border-r-0 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
            >
              <div className="flex flex-col items-center gap-1">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={staffMember.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.name}`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                    {getInitials(staffMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center w-full overflow-hidden">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{staffMember.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                    <span>{staffMember.rating || 5.0}⭐</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Time Grid */}
        <div className="flex-1 overflow-y-auto">
          {timeSlots.map((timeSlot, timeIndex) => (
            <div 
              key={timeSlot.time} 
              className={`border-b border-gray-300 hover:bg-gray-50/30 transition-colors ${
                timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'
              }`}
              style={{ 
                display: 'grid',
                gridTemplateColumns: `120px repeat(${staff.length}, 1fr)`,
                minHeight: '64px'
              }}
            >
              {/* Time Label */}
              <div className="p-3 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center sticky left-0 z-5">
                <span className="text-sm font-semibold text-gray-800">{timeSlot.time}</span>
              </div>
              
              {/* Staff Columns with Enhanced Containment */}
              {staff.map((staffMember, staffIndex) => {
                const slotAppointments = getAppointmentsForStaffAndTime(staffMember.id || '', timeSlot.time);
                
                return (
                  <div 
                    key={`${staffMember.id}-${timeSlot.time}`}
                    className={`p-2 border-r-2 border-gray-400 last:border-r-0 min-h-[64px] overflow-hidden relative ${
                      staffIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                    style={{ 
                      maxWidth: '100%',
                      position: 'relative',
                      isolation: 'isolate'
                    }}
                  >
                    <SortableContext 
                      items={slotAppointments.map(apt => apt.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="w-full h-full overflow-hidden">
                        {slotAppointments.length > 0 ? (
                          <div className="w-full overflow-hidden">
                            {slotAppointments.map(appointment => (
                              <AppointmentBlock key={appointment.id} appointment={appointment} />
                            ))}
                          </div>
                        ) : (
                          <EmptyTimeSlot 
                            staffId={staffMember.id || ''} 
                            time={timeSlot.time} 
                            selectedDate={selectedDate}
                          />
                        )}
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeId && draggedAppointment ? (
          <div className="transform rotate-2 scale-105">
            <AppointmentBlock appointment={draggedAppointment} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DragDropScheduler;
