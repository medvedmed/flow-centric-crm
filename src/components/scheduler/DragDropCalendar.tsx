
import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Phone, DollarSign, Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { Appointment, Staff } from '@/services/types';
import { generateTimeSlots, normalizeTime, getInitials } from './utils';
import { EmptyTimeSlot } from './EmptyTimeSlot';
import { ScheduleSettingsDialog } from './ScheduleSettingsDialog';

const APPOINTMENT_TYPE = 'appointment';
const TIME_SLOT_HEIGHT = 60; // 60px per 30-minute slot

interface DragDropCalendarProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick?: (data: {
    staffId: string;
    time: string;
    date: Date;
  }) => void;
  onAppointmentMove?: (appointmentId: string, newStaffId: string, newTime: string) => void;
  onAppointmentResize?: (appointmentId: string, newDuration: number) => void;
}

interface DraggableAppointmentProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
  onResize?: (appointmentId: string, newDuration: number) => void;
}

interface DroppableTimeSlotProps {
  staffId: string;
  time: string;
  selectedDate: Date;
  appointments: Appointment[];
  onDrop: (appointmentId: string, staffId: string, time: string) => void;
  onTimeSlotClick?: (staffId: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentResize?: (appointmentId: string, newDuration: number) => void;
}

// Helper function to calculate appointment position and height
const calculateAppointmentLayout = (appointment: Appointment, scheduleStart: number) => {
  const startTime = appointment.startTime;
  const duration = appointment.duration || 60;
  
  // Parse start time (HH:MM format)
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  // Calculate position from schedule start
  const minutesFromStart = (startHour - scheduleStart) * 60 + startMinute;
  const top = (minutesFromStart / 30) * TIME_SLOT_HEIGHT; // 30 minutes per slot
  
  // Calculate height based on duration
  const height = Math.max((duration / 30) * TIME_SLOT_HEIGHT, 40); // Minimum 40px height
  
  return { top, height };
};

// Enhanced Draggable Appointment Component
const DraggableAppointment: React.FC<DraggableAppointmentProps> = ({
  appointment,
  onClick,
  onResize
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [initialDuration, setInitialDuration] = useState(appointment.duration || 60);
  
  const [{
    isDragging
  }, drag] = useDrag(() => ({
    type: APPOINTMENT_TYPE,
    item: {
      id: appointment.id,
      appointment
    },
    canDrag: !isResizing,
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  }), [isResizing]);

  const getStatusColor = (status: string, paymentStatus?: string) => {
    if (status === 'Completed') return 'bg-green-50 border-l-green-500';
    if (status === 'Cancelled') return 'bg-red-50 border-l-red-500';
    if (paymentStatus === 'paid') return 'bg-blue-50 border-l-blue-500';
    return 'bg-blue-50 border-l-blue-400';
  };

  const duration = appointment.duration || 60;
  const { height } = calculateAppointmentLayout(appointment, 8); // Assuming 8 AM start

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setInitialDuration(duration);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const deltaY = e.clientY - resizeStartY;
    const deltaMinutes = Math.round((deltaY / TIME_SLOT_HEIGHT) * 30); // Convert pixels to minutes
    const newDuration = Math.max(15, initialDuration + deltaMinutes); // Minimum 15 minutes

    if (onResize) {
      onResize(appointment.id, newDuration);
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStartY, initialDuration]);

  return (
    <div
      ref={drag}
      onClick={() => onClick(appointment)}
      className={`
        absolute w-full cursor-pointer transition-all duration-200 z-10 group
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02] hover:shadow-md'}
        ${isResizing ? 'cursor-ns-resize' : 'cursor-move'}
      `}
      style={{
        height: `${height}px`,
        opacity: isDragging ? 0.5 : 1
      }}
    >
      <Card className={`h-full ${getStatusColor(appointment.status, appointment.paymentStatus)} border-l-4 shadow-sm hover:shadow-md transition-shadow`}>
        <CardContent className="p-2 h-full relative overflow-hidden">
          <div className="flex flex-col h-full justify-between text-xs">
            {/* Header - Client Name */}
            <div className="font-semibold text-gray-900 truncate text-sm">
              {appointment.clientName}
            </div>
            
            {/* Service */}
            <div className="font-medium text-gray-700 truncate mx-0">
              {appointment.service}
            </div>
            
            {/* Time */}
            <div className="text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{appointment.startTime} - {appointment.endTime}</span>
            </div>
            
            {/* Phone if space allows */}
            {height > 100 && appointment.clientPhone && (
              <div className="text-gray-500 flex items-center gap-1 truncate">
                <Phone className="w-3 h-3" />
                <span>{appointment.clientPhone}</span>
              </div>
            )}
            
            {/* Price and Status */}
            <div className="flex items-center justify-between mt-auto">
              <Badge variant="secondary" className="text-xs px-1 py-0">
                ${appointment.price || 0}
              </Badge>
              {appointment.paymentStatus === 'paid' && (
                <Badge variant="default" className="text-xs px-1 py-0">
                  Paid
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Resize Handle */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity" 
        onMouseDown={handleResizeStart}
      >
        <div className="h-full bg-blue-500 rounded-b-lg opacity-50"></div>
      </div>
    </div>
  );
};

// Enhanced Droppable Time Slot Component
const DroppableTimeSlot: React.FC<DroppableTimeSlotProps> = ({
  staffId,
  time,
  selectedDate,
  appointments,
  onDrop,
  onTimeSlotClick,
  onAppointmentClick,
  onAppointmentResize
}) => {
  const [{
    isOver
  }, drop] = useDrop(() => ({
    accept: APPOINTMENT_TYPE,
    drop: (item: {
      id: string;
      appointment: Appointment;
    }) => {
      onDrop(item.id, staffId, time);
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  }));

  const slotAppointments = appointments.filter(apt => 
    apt.staffId === staffId && 
    apt.date === format(selectedDate, 'yyyy-MM-dd')
  );

  // FIXED: Only render appointments that START in this specific time slot
  const appointmentsStartingHere = slotAppointments.filter(apt => {
    return apt.startTime === time; // Only show appointments that start at this exact time
  });

  const handleTimeSlotClick = () => {
    if (onTimeSlotClick && appointmentsStartingHere.length === 0) {
      onTimeSlotClick(staffId, time);
    }
  };

  return (
    <div
      ref={drop}
      className={`
        relative min-h-[${TIME_SLOT_HEIGHT}px] border-b border-gray-100 transition-colors
        ${isOver ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50/30'}
      `}
      style={{ height: `${TIME_SLOT_HEIGHT}px` }}
      onClick={handleTimeSlotClick}
    >
      {appointmentsStartingHere.length > 0 ? (
        appointmentsStartingHere.map(appointment => {
          const duration = appointment.duration || 60;
          const appointmentHeight = Math.max((duration / 30) * TIME_SLOT_HEIGHT, 40);
          
          return (
            <div
              key={appointment.id}
              style={{ 
                position: 'absolute',
                top: '2px',
                left: '2px',
                right: '2px',
                height: `${appointmentHeight}px`,
                zIndex: 10
              }}
            >
              <DraggableAppointment
                appointment={appointment}
                onClick={onAppointmentClick}
                onResize={onAppointmentResize}
              />
            </div>
          );
        })
      ) : (
        <div className="h-full flex items-center justify-center mx-[8px] my-[8px]">
          {isOver && <div className="text-blue-500 text-sm font-medium">Drop here</div>}
          {!isOver && (
            <EmptyTimeSlot
              staffId={staffId}
              time={time}
              selectedDate={selectedDate}
              onTimeSlotClick={onTimeSlotClick}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Main Calendar Component
export const DragDropCalendar: React.FC<DragDropCalendarProps> = ({
  staff,
  appointments,
  selectedDate,
  onDateChange,
  onAppointmentClick,
  onTimeSlotClick,
  onAppointmentMove,
  onAppointmentResize
}) => {
  const [scheduleStart, setScheduleStart] = useState(8);
  const [scheduleEnd, setScheduleEnd] = useState(20);
  const timeSlots = generateTimeSlots(scheduleStart, scheduleEnd);

  // Calculate daily stats
  const todayAppointments = appointments.filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd'));
  const totalRevenue = todayAppointments.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0);
  const completedAppointments = todayAppointments.filter(apt => apt.status === 'Completed').length;

  const handleDrop = useCallback((appointmentId: string, newStaffId: string, newTime: string) => {
    if (onAppointmentMove) {
      onAppointmentMove(appointmentId, newStaffId, newTime);
    }
  }, [onAppointmentMove]);

  const handleResize = useCallback((appointmentId: string, newDuration: number) => {
    if (onAppointmentResize) {
      onAppointmentResize(appointmentId, newDuration);
    }
  }, [onAppointmentResize]);

  const handleTimeSlotClick = useCallback((staffId: string, time: string) => {
    if (onTimeSlotClick) {
      onTimeSlotClick({
        staffId,
        time,
        date: selectedDate
      });
    }
  }, [onTimeSlotClick, selectedDate]);

  const handleTimeRangeChange = (startHour: number, endHour: number) => {
    setScheduleStart(startHour);
    setScheduleEnd(endHour);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => onDateChange(subDays(selectedDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => onDateChange(addDays(selectedDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Daily Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{todayAppointments.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedAppointments}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalRevenue}</div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="grid" style={{
            gridTemplateColumns: `120px repeat(${staff.length}, 1fr)`
          }}>
            {/* Time Column Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 z-20 flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">Time</div>
              <ScheduleSettingsDialog
                startHour={scheduleStart}
                endHour={scheduleEnd}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>

            {/* Staff Headers */}
            {staff.map(staffMember => (
              <div key={staffMember.id} className="sticky top-0 bg-white border-b border-l border-gray-200 p-3 z-20">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={staffMember.imageUrl || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(staffMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{staffMember.name}</div>
                    <div className="text-xs text-gray-500">Staff Member</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Time Slots */}
            {timeSlots.map(timeSlot => (
              <React.Fragment key={timeSlot.time}>
                {/* Time Label */}
                <div className={`border-b border-gray-100 p-3 ${timeSlot.isFullHour ? 'bg-gray-50/70' : 'bg-white'}`} style={{ height: `${TIME_SLOT_HEIGHT}px` }}>
                  <div className={`text-sm ${timeSlot.isFullHour ? 'font-semibold text-gray-700' : 'font-medium text-gray-500'}`}>
                    {timeSlot.display}
                  </div>
                </div>

                {/* Staff Time Slots */}
                {staff.map(staffMember => (
                  <div key={`${staffMember.id}-${timeSlot.time}`} className="border-b border-l border-gray-100 bg-white">
                    <DroppableTimeSlot
                      staffId={staffMember.id || ''}
                      time={timeSlot.time}
                      selectedDate={selectedDate}
                      appointments={appointments}
                      onDrop={handleDrop}
                      onTimeSlotClick={handleTimeSlotClick}
                      onAppointmentClick={onAppointmentClick}
                      onAppointmentResize={handleResize}
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
