
import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, Phone, DollarSign, Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { Appointment, Staff } from '@/services/types';
import { DroppableTimeSlot } from './DroppableTimeSlot';
import { AppointmentBlock } from './AppointmentBlock';
import { EmptyTimeSlot } from './EmptyTimeSlot';
import { generateTimeSlots, normalizeTime, getInitials } from './utils';

interface ModernSchedulerGridProps {
  staff: Staff[];
  appointments: Appointment[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick?: (data: { staffId: string; time: string; date: Date }) => void;
  onAppointmentMove?: (appointmentId: string, newStaffId: string, newTime: string) => void;
}

export const ModernSchedulerGrid: React.FC<ModernSchedulerGridProps> = ({
  staff,
  appointments,
  selectedDate,
  onDateChange,
  onAppointmentClick,
  onTimeSlotClick,
  onAppointmentMove
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  
  const timeSlots = generateTimeSlots();

  // Calculate daily stats
  const todayAppointments = appointments.filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd'));
  const totalRevenue = todayAppointments.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0);
  const completedAppointments = todayAppointments.filter(apt => apt.status === 'Completed').length;

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

    const overData = over.data?.current;
    if (overData?.type === 'timeSlot' && overData?.staffId && overData?.time) {
      const { staffId: newStaffId, time: newTime } = overData;
      if (newStaffId !== draggedAppointment.staffId || newTime !== normalizeTime(draggedAppointment.startTime)) {
        onAppointmentMove?.(active.id as string, newStaffId, newTime);
      }
    }

    setActiveId(null);
    setDraggedAppointment(null);
  };

  const getAppointmentsForStaffAndTime = useCallback((staffId: string, time: string) => {
    const normalizedTime = normalizeTime(time);
    return todayAppointments.filter(apt => 
      apt.staffId === staffId && normalizeTime(apt.startTime) === normalizedTime
    );
  }, [todayAppointments]);

  const handleTimeSlotClick = useCallback((staffId: string, time: string) => {
    onTimeSlotClick?.({
      staffId,
      time,
      date: selectedDate
    });
  }, [onTimeSlotClick, selectedDate]);

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Header with Date Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDateChange(subDays(selectedDate, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
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

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {todayAppointments.length} appointments • ${totalRevenue.toFixed(0)} revenue
              </div>
            </div>
          </div>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex flex-col min-h-0">
            {/* Staff Header Row */}
            <div 
              className="bg-white border-b-2 border-gray-300 shadow-sm flex-shrink-0"
              style={{ 
                display: 'grid',
                gridTemplateColumns: `120px repeat(${staff.length}, 1fr)` 
              }}
            >
              <div className="p-4 border-r-2 border-gray-300 bg-gray-50 flex items-center justify-center">
                <span className="font-semibold text-gray-700 text-sm">TIME</span>
              </div>
              
              {staff.map((staffMember, index) => (
                <div 
                  key={staffMember.id}
                  className={`p-4 border-r-2 border-gray-300 last:border-r-0 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-blue-200">
                      <AvatarImage 
                        src={staffMember.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.name}`} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                        {getInitials(staffMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 text-sm">{staffMember.name}</h3>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-xs text-amber-600">⭐ {staffMember.rating || 5.0}</span>
                      </div>
                      
                      {/* Daily stats for this staff member */}
                      <div className="mt-2 flex gap-2 text-xs">
                        <Badge variant="secondary" className="px-1.5 py-0.5">
                          {todayAppointments.filter(apt => apt.staffId === staffMember.id).length} apt
                        </Badge>
                        <Badge variant="outline" className="px-1.5 py-0.5 text-green-600 border-green-200">
                          ${todayAppointments
                            .filter(apt => apt.staffId === staffMember.id)
                            .reduce((sum, apt) => sum + (Number(apt.price) || 0), 0)
                            .toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="flex-1 overflow-y-auto bg-white">
              {timeSlots.map((timeSlot, timeIndex) => (
                <div 
                  key={timeSlot.time}
                  className={`border-b border-gray-200 hover:bg-gray-50/50 transition-colors ${
                    timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'
                  }`}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: `120px repeat(${staff.length}, 1fr)`,
                    minHeight: '80px'
                  }}
                >
                  {/* Time Label */}
                  <div className="p-3 border-r-2 border-gray-300 bg-gray-50 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">{timeSlot.time}</span>
                  </div>
                  
                  {/* Staff Columns */}
                  {staff.map((staffMember, staffIndex) => {
                    const slotId = `${staffMember.id}-${timeSlot.time}`;
                    const slotAppointments = getAppointmentsForStaffAndTime(staffMember.id || '', timeSlot.time);
                    
                    return (
                      <DroppableTimeSlot
                        key={slotId}
                        staffId={staffMember.id || ''}
                        time={timeSlot.time}
                      >
                        <div 
                          className={`p-2 border-r-2 border-gray-300 last:border-r-0 min-h-[80px] relative ${
                            staffIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50/20'
                          }`}
                        >
                          <SortableContext 
                            items={slotAppointments.map(a => a.id)} 
                            strategy={verticalListSortingStrategy}
                          >
                            {slotAppointments.length > 0 ? (
                              slotAppointments.map(appointment => (
                                <div
                                  key={appointment.id}
                                  onClick={() => onAppointmentClick(appointment)}
                                  className="cursor-pointer mb-1"
                                >
                                  <AppointmentBlock appointment={appointment} />
                                </div>
                              ))
                            ) : (
                              <EmptyTimeSlot
                                staffId={staffMember.id || ''}
                                time={timeSlot.time}
                                selectedDate={selectedDate}
                                onTimeSlotClick={handleTimeSlotClick}
                              />
                            )}
                          </SortableContext>
                        </div>
                      </DroppableTimeSlot>
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
      </div>

      {/* Right Sidebar with Stats */}
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="space-y-6">
          {/* Daily Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Appointments</span>
                  <Badge variant="secondary">{todayAppointments.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {completedAppointments}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    ${totalRevenue.toFixed(0)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Performance Today */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Staff Performance</h3>
              <div className="space-y-3">
                {staff.map(staffMember => {
                  const staffAppointments = todayAppointments.filter(apt => apt.staffId === staffMember.id);
                  const staffRevenue = staffAppointments.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0);
                  
                  return (
                    <div key={staffMember.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={staffMember.imageUrl} />
                          <AvatarFallback className="text-xs">
                            {getInitials(staffMember.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{staffMember.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{staffAppointments.length}</span>
                        <span className="text-xs font-medium text-green-600">${staffRevenue.toFixed(0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Appointment
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Quick Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
