
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Appointment } from '@/services/types';
import { useAppointmentOperations } from '@/hooks/useAppointmentOperations';
import { useToast } from '@/hooks/use-toast';
import { DragDropSchedulerProps } from './scheduler/types';
import { DroppableTimeSlot } from './scheduler/DroppableTimeSlot';
import { AppointmentBlock } from './scheduler/AppointmentBlock';
import { EmptyTimeSlot } from './scheduler/EmptyTimeSlot';
import { normalizeTime, getInitials, generateTimeSlots } from './scheduler/utils';

const DragDropScheduler: React.FC<DragDropSchedulerProps> = ({
  staff,
  appointments,
  selectedDate,
  onAppointmentMove,
  onRefresh,
  onAppointmentClick
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [conflictingSlots, setConflictingSlots] = useState<Set<string>>(new Set());
  const { moveAppointment, isMoving } = useAppointmentOperations();
  const { toast } = useToast();

  console.log('DragDropScheduler received:', { 
    staff: staff.length, 
    appointments: appointments.length,
    appointmentIds: appointments.map(a => a.id),
    selectedDate: selectedDate.toISOString().split('T')[0]
  });

  const timeSlots = generateTimeSlots();

  // Check for conflicts when dragging
  const checkConflicts = (staffId: string, time: string, excludeAppointmentId?: string) => {
    return appointments.some(apt => 
      apt.id !== excludeAppointmentId &&
      apt.staffId === staffId &&
      normalizeTime(apt.startTime) === normalizeTime(time)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const appointment = appointments.find(apt => apt.id === active.id);
    setDraggedAppointment(appointment || null);
    console.log('Drag started for appointment:', appointment);

    // Pre-calculate conflicts for all slots
    if (appointment) {
      const conflicts = new Set<string>();
      staff.forEach(staffMember => {
        timeSlots.forEach(slot => {
          if (checkConflicts(staffMember.id || '', slot.time, appointment.id)) {
            conflicts.add(`${staffMember.id}-${slot.time}`);
          }
        });
      });
      setConflictingSlots(conflicts);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag ended:', { active: active.id, over: over?.id, overData: over?.data?.current });
    
    setConflictingSlots(new Set());
    
    if (!over || !draggedAppointment) {
      console.log('No valid drop target or dragged appointment');
      setActiveId(null);
      setDraggedAppointment(null);
      return;
    }

    const overData = over.data?.current;

    // Check if we're dropping on a time slot
    if (overData?.type === 'timeSlot' && overData?.staffId && overData?.time) {
      const { staffId: newStaffId, time: newTime } = overData;
      
      console.log('Dropping on time slot:', { newStaffId, newTime });
      console.log('Current appointment:', { 
        staffId: draggedAppointment.staffId, 
        startTime: draggedAppointment.startTime 
      });
      
      // Only move if it's actually a different position
      if (newStaffId !== draggedAppointment.staffId || newTime !== normalizeTime(draggedAppointment.startTime)) {
        // Check for conflicts
        if (checkConflicts(newStaffId, newTime, draggedAppointment.id)) {
          toast({
            title: "Cannot Move Appointment",
            description: "This time slot is already occupied by another appointment.",
            variant: "destructive",
          });
        } else {
          console.log('Moving appointment to new position');
          
          // Move the appointment
          moveAppointment({
            appointmentId: active.id as string,
            newStaffId,
            newTime,
            duration: draggedAppointment.duration || 60
          });

          // Call the callback if provided
          if (onAppointmentMove) {
            onAppointmentMove(active.id as string, newStaffId, newTime);
          }
        }
      } else {
        console.log('Same position, no move needed');
      }
    }

    setActiveId(null);
    setDraggedAppointment(null);
  };

  const getAppointmentsForStaffAndTime = (staffId: string, time: string) => {
    const normalizedTime = normalizeTime(time);
    const staffAppointments = appointments.filter(apt => {
      const normalizedStartTime = normalizeTime(apt.startTime);
      const staffMatches = apt.staffId === staffId;
      const timeMatches = normalizedStartTime === normalizedTime;
      
      if (staffMatches && timeMatches) {
        console.log('Found appointment match:', { 
          appointmentId: apt.id, 
          staffId, 
          time: normalizedTime, 
          appointmentStartTime: normalizedStartTime,
          clientName: apt.clientName
        });
      }
      return staffMatches && timeMatches;
    });
    
    return staffAppointments;
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
      <div className="w-full h-full bg-white overflow-hidden flex flex-col relative">
        {/* Loading overlay */}
        {isMoving && (
          <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Moving appointment...</p>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-gray-100 p-2 text-xs text-gray-600 border-b">
          <p>Total appointments: {appointments.length} | Staff: {staff.length} | Date: {selectedDate.toDateString()}</p>
        </div>

        {/* Sticky Staff Header */}
        <div 
          className="sticky top-0 z-20 bg-white border-b-2 border-gray-400 shadow-sm flex-shrink-0"
          style={{ 
            display: 'grid',
            gridTemplateColumns: `100px repeat(${staff.length}, 1fr)` 
          }}
        >
          {/* Time Column Header */}
          <div className="p-2 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center">
            <span className="font-bold text-gray-800 text-xs">TIME</span>
          </div>
          
          {/* Staff Headers */}
          {staff.map((staffMember) => (
            <div 
              key={staffMember.id} 
              className="p-2 border-r-2 border-gray-400 last:border-r-0 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
              style={{ minWidth: 0 }}
            >
              <div className="flex flex-col items-center gap-1">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={staffMember.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staffMember.name}`} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                    {getInitials(staffMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center w-full overflow-hidden">
                  <h3 className="font-semibold text-gray-800 text-xs truncate">{staffMember.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                    <span className="text-xs">{staffMember.rating || 5.0}⭐</span>
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
                gridTemplateColumns: `100px repeat(${staff.length}, 1fr)`,
                minHeight: '60px'
              }}
            >
              {/* Time Label */}
              <div className="p-2 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center sticky left-0 z-10">
                <span className="text-xs font-semibold text-gray-800">{timeSlot.time}</span>
              </div>
              
              {/* Staff Columns with Drop Zones */}
              {staff.map((staffMember, staffIndex) => {
                const slotAppointments = getAppointmentsForStaffAndTime(staffMember.id || '', timeSlot.time);
                const slotId = `${staffMember.id}-${timeSlot.time}`;
                const hasConflict = conflictingSlots.has(slotId);
                
                return (
                  <DroppableTimeSlot
                    key={slotId}
                    staffId={staffMember.id || ''}
                    time={timeSlot.time}
                    hasConflict={hasConflict}
                  >
                    <div 
                      className={`p-1 border-r-2 border-gray-400 last:border-r-0 min-h-[60px] overflow-hidden relative ${
                        staffIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                      style={{ 
                        maxWidth: '100%',
                        minWidth: 0,
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
                                <div
                                  key={appointment.id}
                                  onClick={() => onAppointmentClick?.(appointment)}
                                  className="cursor-pointer"
                                >
                                  <AppointmentBlock appointment={appointment} />
                                </div>
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
                  </DroppableTimeSlot>
                );
              })}
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

export default DragDropScheduler;
