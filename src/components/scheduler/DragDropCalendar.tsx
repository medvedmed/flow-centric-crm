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

const APPOINTMENT_TYPE = 'appointment';

interface DragDropCalendarProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick?: (data: { staffId: string; time: string; date: Date }) => void;
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

// Draggable Appointment Component with Resize Functionality
const DraggableAppointment: React.FC<DraggableAppointmentProps> = ({ appointment, onClick, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [initialDuration, setInitialDuration] = useState(appointment.duration || 60);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: APPOINTMENT_TYPE,
    item: { id: appointment.id, appointment },
    canDrag: !isResizing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [isResizing]);

  const getStatusColor = (status: string, paymentStatus?: string) => {
    if (status === 'Completed') return 'bg-green-100 border-green-300';
    if (status === 'Cancelled') return 'bg-red-100 border-red-300';
    if (paymentStatus === 'paid') return 'bg-blue-100 border-blue-300';
    return 'bg-yellow-100 border-yellow-300';
  };

  const duration = appointment.duration || 60;
  const height = Math.max((duration / 60) * 80, 96); // Increased minimum height to 96px for better info display

  const handleResizeStart = (e: React.MouseEvent, direction: 'top' | 'bottom') => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setInitialDuration(duration);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaY = e.clientY - resizeStartY;
    const deltaMinutes = Math.round(deltaY / 80 * 60); // Convert pixels to minutes
    const newDuration = Math.max(15, initialDuration + deltaMinutes); // Minimum 15 minutes
    
    if (onResize) {
      onResize(appointment.id, newDuration);
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Add event listeners for resize
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
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02] hover:shadow-lg'}
        ${isResizing ? 'cursor-ns-resize' : 'cursor-move'}
      `}
      style={{ 
        height: `${height}px`,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* Top Resize Handle */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, 'top')}
      >
        <div className="h-full bg-blue-500 rounded-t-lg opacity-50"></div>
      </div>

      <Card className={`h-full ${getStatusColor(appointment.status, appointment.paymentStatus)} border-l-4 shadow-md`}>
        <CardContent className="p-3 h-full relative">
          <div className="flex flex-col h-full justify-between">
            {/* Header Section */}
            <div className="space-y-1">
              <div className="font-semibold text-base text-gray-800">
                {appointment.clientName}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{appointment.clientPhone}</span>
              </div>
            </div>
            
            {/* Middle Section */}
            <div className="flex-1 flex flex-col justify-center space-y-2">
              <div className="text-sm font-medium text-gray-700 bg-white/50 rounded px-2 py-1">
                {appointment.service}
              </div>
              
              {appointment.notes && (
                <div className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 max-h-8 overflow-hidden">
                  {appointment.notes}
                </div>
              )}
            </div>
            
            {/* Footer Section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {appointment.startTime} - {appointment.endTime}
                </span>
                <Badge variant="secondary" className="text-sm font-semibold">
                  ${appointment.price || 0}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={appointment.status === 'Completed' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {appointment.status}
                </Badge>
                {appointment.paymentStatus && (
                  <Badge 
                    variant={appointment.paymentStatus === 'paid' ? 'default' : 'outline'} 
                    className="text-xs"
                  >
                    {appointment.paymentStatus}
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                Duration: {duration} min
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Resize Handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleResizeStart(e, 'bottom')}
      >
        <div className="h-full bg-blue-500 rounded-b-lg opacity-50"></div>
      </div>
    </div>
  );
};

// Droppable Time Slot Component
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
  const [{ isOver }, drop] = useDrop(() => ({
    accept: APPOINTMENT_TYPE,
    drop: (item: { id: string; appointment: Appointment }) => {
      onDrop(item.id, staffId, time);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const slotAppointments = appointments.filter(apt => 
    apt.staffId === staffId && 
    normalizeTime(apt.startTime) === normalizeTime(time) &&
    apt.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const handleTimeSlotClick = () => {
    if (onTimeSlotClick && slotAppointments.length === 0) {
      onTimeSlotClick(staffId, time);
    }
  };

  return (
    <div
      ref={drop}
    className={`
        relative min-h-[80px] border-b border-gray-100 transition-colors
        ${isOver ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50/50'}
      `}
      onClick={handleTimeSlotClick}
    >
      {slotAppointments.length > 0 ? (
        slotAppointments.map((appointment, index) => (
          <DraggableAppointment
            key={appointment.id}
            appointment={appointment}
            onClick={onAppointmentClick}
            onResize={onAppointmentResize}
          />
        ))
      ) : (
        <div className="h-full flex items-center justify-center">
          {isOver && (
            <div className="text-blue-500 text-sm font-medium">Drop here</div>
          )}
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
  const timeSlots = generateTimeSlots();

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
      onTimeSlotClick({ staffId, time, date: selectedDate });
    }
  }, [onTimeSlotClick, selectedDate]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(addDays(selectedDate, 1))}
            >
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
        <div className="flex-1 overflow-auto">
          <div className="grid" style={{ gridTemplateColumns: `80px repeat(${staff.length}, 1fr)` }}>
            {/* Time Column Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-20">
              <div className="text-sm font-medium text-gray-500">Time</div>
            </div>

            {/* Staff Headers */}
            {staff.map((staffMember) => (
              <div key={staffMember.id} className="sticky top-0 bg-white border-b border-l border-gray-200 p-4 z-20">
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
            {timeSlots.map((timeSlot, timeIndex) => (
              <React.Fragment key={timeSlot.time}>
                {/* Time Label */}
                <div className="border-b border-gray-100 p-3 bg-gray-50/50">
                  <div className="text-sm font-medium text-gray-600">{timeSlot.display}</div>
                </div>

                {/* Staff Time Slots */}
                {staff.map((staffMember) => (
                  <div key={`${staffMember.id}-${timeSlot.time}`} className="border-b border-l border-gray-100 min-h-[80px]">
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