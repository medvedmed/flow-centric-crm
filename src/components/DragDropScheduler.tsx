import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Appointment } from '@/services/types';
import { useAppointmentOperations } from '@/hooks/useAppointmentOperations';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { moveAppointment, isMoving } = useAppointmentOperations();
  const { toast } = useToast();
  const timeSlots = generateTimeSlots();

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
    setConflictingSlots(new Set());

    if (!over || !draggedAppointment) {
      setActiveId(null);
      setDraggedAppointment(null);
      return;
    }

    const overData = over.data?.current;
    if (overData?.type === 'timeSlot' && overData?.staffId && overData?.time) {
      const { staffId: newStaffId, time: newTime } = overData;
      if (newStaffId !== draggedAppointment.staffId || newTime !== normalizeTime(draggedAppointment.startTime)) {
        if (checkConflicts(newStaffId, newTime, draggedAppointment.id)) {
          toast({ title: 'Cannot Move Appointment', description: 'Time slot is occupied.', variant: 'destructive' });
        } else {
          moveAppointment({
            appointmentId: active.id as string,
            newStaffId,
            newTime,
            duration: draggedAppointment.duration || 60
          });
          onAppointmentMove?.(active.id as string, newStaffId, newTime);
        }
      }
    }

    setActiveId(null);
    setDraggedAppointment(null);
  };

  const getAppointmentsForStaffAndTime = (staffId: string, time: string) => {
    const normalizedTime = normalizeTime(time);
    return appointments.filter(apt => apt.staffId === staffId && normalizeTime(apt.startTime) === normalizedTime);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-full bg-white">
        {isMoving && (
          <div className="absolute inset-0 bg-black/10 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Moving appointment...</p>
            </div>
          </div>
        )}

        <div className="bg-gray-100 p-2 text-xs text-gray-600 border-b">
          <p>Total appointments: {appointments.length} | Staff: {staff.length} | Date: {selectedDate.toDateString()}</p>
        </div>

        <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-400 shadow-sm grid" style={{ gridTemplateColumns: `100px repeat(${staff.length}, 1fr)` }}>
          <div className="p-2 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center">
            <span className="font-bold text-gray-800 text-xs">TIME</span>
          </div>
          {staff.map(staffMember => (
            <div key={staffMember.id} className="p-2 border-r-2 border-gray-400 last:border-r-0 bg-gradient-to-b from-gray-50 to-white">
              <div className="flex flex-col items-center gap-1">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={staffMember.imageUrl} />
                  <AvatarFallback>{getInitials(staffMember.name)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xs font-semibold text-center truncate">{staffMember.name}</h3>
                <span className="text-xs text-gray-500">⭐ {staffMember.rating || 5.0}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {timeSlots.map((timeSlot, idx) => (
            <div key={timeSlot.time} className={`border-b border-gray-300 grid min-h-[60px] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`} style={{ gridTemplateColumns: `100px repeat(${staff.length}, 1fr)` }}>
              <div className="p-2 border-r-2 border-gray-400 bg-gray-100 flex items-center justify-center sticky left-0 z-10">
                <span className="text-xs font-semibold text-gray-800">{timeSlot.time}</span>
              </div>
              {staff.map((staffMember, index) => {
                const slotId = `${staffMember.id}-${timeSlot.time}`;
                const slotAppointments = getAppointmentsForStaffAndTime(staffMember.id || '', timeSlot.time);
                const hasConflict = conflictingSlots.has(slotId);
                return (
                  <DroppableTimeSlot key={slotId} staffId={staffMember.id || ''} time={timeSlot.time} hasConflict={hasConflict}>
                    <div className={`p-1 border-r-2 border-gray-400 last:border-r-0 min-h-[60px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <SortableContext items={slotAppointments.map(a => a.id)} strategy={verticalListSortingStrategy}>
                        <div>
                          {slotAppointments.length ? (
                            slotAppointments.map(appointment => (
                              <div key={appointment.id} onClick={() => setSelectedAppointment(appointment)} className="cursor-pointer">
                                <AppointmentBlock appointment={appointment} />
                              </div>
                            ))
                          ) : (
                            <EmptyTimeSlot staffId={staffMember.id || ''} time={timeSlot.time} selectedDate={selectedDate} />
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
        {activeId && draggedAppointment ? <AppointmentBlock appointment={draggedAppointment} isDragging /> : null}
      </DragOverlay>

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Info</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <Label>Client</Label>
                <Input value={selectedAppointment.clientName} readOnly />
              </div>
              <div>
                <Label>Time</Label>
                <Input value={selectedAppointment.startTime} readOnly />
              </div>
              <div>
                <Label>Staff</Label>
                <Input value={staff.find(s => s.id === selectedAppointment.staffId)?.name || ''} readOnly />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DndContext>
  );
};

export default DragDropScheduler;
