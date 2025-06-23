
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, DollarSign, Plus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Staff, Appointment } from '@/services/types';
import { AddAppointmentDialog } from './AddAppointmentDialog';

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

// Enhanced Appointment Block Component with larger size and more info
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
    minHeight: '80px', // Larger blocks for better visibility
  };

  const statusColors = {
    'Scheduled': 'bg-blue-50 border-blue-200 text-blue-800',
    'Confirmed': 'bg-green-50 border-green-200 text-green-800', 
    'In Progress': 'bg-purple-50 border-purple-200 text-purple-800',
    'Completed': 'bg-gray-50 border-gray-200 text-gray-800',
    'Cancelled': 'bg-red-50 border-red-200 text-red-800',
    'No Show': 'bg-orange-50 border-orange-200 text-orange-800'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing rounded-lg border-2 p-3 mb-2 shadow-sm hover:shadow-md transition-shadow ${
        statusColors[appointment.status as keyof typeof statusColors] || statusColors.Scheduled
      } ${isDragging ? 'z-50' : ''}`}
    >
      <div className="space-y-2">
        {/* Time and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="text-sm font-medium">
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {appointment.status}
          </Badge>
        </div>
        
        {/* Client Info */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          <div className="flex-1">
            <p className="font-medium text-sm">{appointment.clientName}</p>
            {appointment.clientPhone && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                <span>{appointment.clientPhone}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Service and Price */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">{appointment.service}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{appointment.duration}min</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-green-600" />
              <span className="text-sm font-medium text-green-600">${appointment.price}</span>
            </div>
          </div>
        </div>

        {/* Notes if any */}
        {appointment.notes && (
          <p className="text-xs text-gray-500 truncate">{appointment.notes}</p>
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
    <div className="h-20 border border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
      <AddAppointmentDialog
        selectedDate={selectedDate}
        selectedTime={time}
        selectedStaffId={staffId}
        trigger={
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
            <Plus className="w-4 h-4 text-gray-400" />
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
      // Extract staff ID and time from the drop target
      const dropData = (over.data?.current as any) || {};
      if (dropData.staffId && dropData.time) {
        onAppointmentMove(active.id as string, dropData.staffId, dropData.time);
      }
    }

    setActiveId(null);
    setDraggedAppointment(null);
  };

  const getAppointmentsForStaffAndTime = (staffId: string, time: string) => {
    return appointments.filter(apt => 
      apt.staffId === staffId && apt.startTime === time
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (staff.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>No Staff Available</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 text-center mb-4">
            Add staff members to start scheduling appointments.
          </p>
          <Button onClick={onRefresh} variant="outline">
            Refresh Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header with Staff Columns */}
        <div className="grid border-b border-gray-200 bg-gray-50" style={{ 
          gridTemplateColumns: `140px repeat(${staff.length}, 1fr)` 
        }}>
          <div className="p-4 border-r border-gray-200">
            <h3 className="font-semibold text-gray-800">Time</h3>
          </div>
          {staff.map((staffMember, index) => (
            <div 
              key={staffMember.id} 
              className={`p-4 border-r border-gray-200 last:border-r-0 ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={staffMember.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.name}`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm">
                    {getInitials(staffMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{staffMember.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{staffMember.rating || 5.0}⭐</span>
                    <span>•</span>
                    <span>{staffMember.efficiency || 100}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map(timeSlot => (
            <div 
              key={timeSlot.time} 
              className="grid border-b border-gray-100 hover:bg-gray-50 transition-colors"
              style={{ gridTemplateColumns: `140px repeat(${staff.length}, 1fr)` }}
            >
              {/* Time Label */}
              <div className="p-3 border-r border-gray-100 flex items-center bg-gray-50">
                <span className="text-sm font-medium text-gray-700">{timeSlot.time}</span>
              </div>
              
              {/* Staff Columns */}
              {staff.map((staffMember, index) => {
                const slotAppointments = getAppointmentsForStaffAndTime(staffMember.id || '', timeSlot.time);
                
                return (
                  <div 
                    key={`${staffMember.id}-${timeSlot.time}`}
                    className={`p-2 border-r border-gray-100 last:border-r-0 min-h-[80px] ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <SortableContext 
                      items={slotAppointments.map(apt => apt.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      {slotAppointments.length > 0 ? (
                        slotAppointments.map(appointment => (
                          <AppointmentBlock key={appointment.id} appointment={appointment} />
                        ))
                      ) : (
                        <EmptyTimeSlot 
                          staffId={staffMember.id || ''} 
                          time={timeSlot.time} 
                          selectedDate={selectedDate}
                        />
                      )}
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
