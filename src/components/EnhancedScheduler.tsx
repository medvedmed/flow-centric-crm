
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, User, DollarSign, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { permissionAwareScheduleApi } from '@/services/permissionAwareScheduleApi';
import { realTimeScheduleApi, ScheduleConflict } from '@/services/api/realTimeScheduleApi';
import { Appointment, Staff } from '@/services/types';

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

// Enhanced Appointment Block with validation
const EnhancedAppointmentBlock: React.FC<{
  appointment: Appointment;
  isDragging?: boolean;
  conflicts?: ScheduleConflict[];
}> = ({ appointment, isDragging = false, conflicts = [] }) => {
  const { isRTL } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: appointment.id || '' });

  const bgColor = serviceColors[appointment.service as keyof typeof serviceColors] || '#8b5cf6';
  const hasConflicts = conflicts.length > 0;

  const combinedStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.6 : 1,
    borderLeftColor: hasConflicts ? '#ef4444' : bgColor,
    minHeight: `${Math.max(appointment.duration / 15 * 16, 48)}px`
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      {...listeners}
      className={`fresha-appointment cursor-grab active:cursor-grabbing absolute inset-x-1 z-10 ${isDragging ? 'z-50' : ''} ${hasConflicts ? 'border-red-500 bg-red-50' : ''}`}
    >
      <div className="fresha-appointment-content">
        {hasConflicts && (
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-600">Conflict</span>
          </div>
        )}
        
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

// Enhanced Empty Slot with availability checking
const EnhancedEmptySlot: React.FC<{
  staffId: string;
  staffName: string;
  time: string;
  date: string;
  isAvailable: boolean;
  reason?: string;
  onBookSlot: (slot: BookingSlot) => void;
}> = ({ staffId, staffName, time, date, isAvailable, reason, onBookSlot }) => {
  const { t, isRTL } = useLanguage();
  
  const handleClick = () => {
    if (isAvailable) {
      onBookSlot({ staffId, time, staffName });
    }
  };

  return (
    <div 
      className={`h-16 transition-all duration-200 flex items-center justify-center group relative border-b border-gray-100/50 ${
        isAvailable 
          ? 'cursor-pointer hover:bg-purple-50/50' 
          : 'cursor-not-allowed bg-gray-50/50'
      }`}
      onClick={handleClick}
    >
      {isAvailable ? (
        <>
          <Plus className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:text-purple-500" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className={`text-xs text-purple-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-purple-200 ${isRTL ? 'font-arabic' : ''}`}>
              {t('click_to_book_slot')}
            </span>
          </div>
        </>
      ) : (
        <div className="text-xs text-gray-400 text-center px-2">
          {reason || 'Unavailable'}
        </div>
      )}
    </div>
  );
};

// Enhanced Grid Cell with real-time availability
const EnhancedGridCell: React.FC<{
  timeSlot: TimeSlot;
  staff: Staff;
  appointments: Appointment[];
  date: string;
  appointmentConflicts: Record<string, ScheduleConflict[]>;
  onBookSlot: (slot: BookingSlot) => void;
}> = ({ timeSlot, staff, appointments, date, appointmentConflicts, onBookSlot }) => {
  const [slotAvailability, setSlotAvailability] = useState<{ isAvailable: boolean; reason?: string }>({ isAvailable: true });
  
  const cellAppointments = appointments.filter(apt => 
    apt.staffId === staff.id && apt.startTime === timeSlot.time
  );

  useEffect(() => {
    const checkAvailability = async () => {
      if (cellAppointments.length === 0) {
        // Check if this time slot is available for a 60-minute appointment
        const endTime = new Date(`2000-01-01 ${timeSlot.time}`);
        endTime.setMinutes(endTime.getMinutes() + 60);
        const endTimeString = endTime.toTimeString().slice(0, 5);
        
        const availability = await realTimeScheduleApi.checkStaffAvailability(
          staff.id || '',
          date,
          timeSlot.time,
          endTimeString
        );
        
        setSlotAvailability({
          isAvailable: availability.isAvailable,
          reason: availability.conflicts.length > 0 ? availability.conflicts[0].message : undefined
        });
      }
    };

    checkAvailability();
  }, [staff.id, date, timeSlot.time, cellAppointments.length]);

  return (
    <div className="relative h-16 border-b border-gray-100/30">
      <SortableContext items={cellAppointments.map(apt => apt.id || '')} strategy={verticalListSortingStrategy}>
        {cellAppointments.length > 0 ? (
          cellAppointments.map(appointment => (
            <EnhancedAppointmentBlock 
              key={appointment.id} 
              appointment={appointment} 
              conflicts={appointmentConflicts[appointment.id || '']}
            />
          ))
        ) : (
          <EnhancedEmptySlot 
            staffId={staff.id || ''} 
            staffName={staff.name}
            time={timeSlot.time}
            date={date}
            isAvailable={slotAvailability.isAvailable}
            reason={slotAvailability.reason}
            onBookSlot={onBookSlot} 
          />
        )}
      </SortableContext>
    </div>
  );
};

// Main Enhanced Scheduler Component
interface EnhancedSchedulerProps {
  date: string;
  onBookSlot: (slot: BookingSlot) => void;
  onAppointmentUpdate: () => void;
}

const EnhancedScheduler: React.FC<EnhancedSchedulerProps> = ({
  date,
  onBookSlot,
  onAppointmentUpdate,
}) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentConflicts, setAppointmentConflicts] = useState<Record<string, ScheduleConflict[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate time slots (9 AM to 6 PM in 15-minute intervals)
  const timeSlots: TimeSlot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push({
        time: timeString,
        hour,
        minute
      });
    }
  }

  useEffect(() => {
    loadScheduleData();
  }, [date]);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const [staffData, appointmentData] = await Promise.all([
        permissionAwareScheduleApi.getUserAccessibleStaff(),
        permissionAwareScheduleApi.getUserAccessibleAppointments(date)
      ]);
      
      setStaff(staffData);
      setAppointments(appointmentData);
      
      // Check for conflicts in existing appointments
      const conflicts: Record<string, ScheduleConflict[]> = {};
      for (const appointment of appointmentData) {
        if (appointment.id) {
          const availability = await realTimeScheduleApi.checkStaffAvailability(
            appointment.staffId,
            appointment.date,
            appointment.startTime,
            appointment.endTime
          );
          if (!availability.isAvailable) {
            conflicts[appointment.id] = availability.conflicts;
          }
        }
      }
      setAppointmentConflicts(conflicts);
      
    } catch (error) {
      console.error('Error loading schedule data:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const appointment = appointments.find(apt => apt.id === active.id);
    setDraggedAppointment(appointment || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedAppointment || !draggedAppointment.id) {
      setActiveId(null);
      setDraggedAppointment(null);
      return;
    }

    const overId = over.id as string;
    
    if (overId !== active.id) {
      // Find the target time slot and staff
      const targetAppointment = appointments.find(apt => apt.id === overId);
      if (targetAppointment) {
        // Calculate new end time
        const startTime = new Date(`2000-01-01 ${targetAppointment.startTime}`);
        const endTime = new Date(startTime.getTime() + (draggedAppointment.duration || 60) * 60000);
        const endTimeString = endTime.toTimeString().slice(0, 5);

        const result = await permissionAwareScheduleApi.moveAppointmentWithValidation(
          draggedAppointment.id,
          targetAppointment.staffId,
          date,
          targetAppointment.startTime,
          endTimeString
        );

        if (result.success) {
          toast({
            title: "Appointment Moved",
            description: "The appointment has been successfully moved.",
          });
          onAppointmentUpdate();
          loadScheduleData();
        } else {
          toast({
            title: "Cannot Move Appointment",
            description: result.error || "Unknown error occurred",
            variant: "destructive",
          });
        }
      }
    }

    setActiveId(null);
    setDraggedAppointment(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No accessible staff members found. Please check your permissions or add staff members.
        </AlertDescription>
      </Alert>
    );
  }

  // Show conflicts summary
  const totalConflicts = Object.keys(appointmentConflicts).length;

  return (
    <div className="space-y-4">
      {totalConflicts > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {totalConflicts} appointment{totalConflicts > 1 ? 's have' : ' has'} scheduling conflicts that need attention.
          </AlertDescription>
        </Alert>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="fresha-grid fresha-fade-in">
          {/* Header */}
          <div className={`grid grid-cols-[180px_repeat(${staff.length},1fr)] fresha-header ${isRTL ? 'text-right' : ''}`}>
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
                    src={staffMember.imageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b494?w=400&h=400&fit=crop&crop=face`}
                    alt={staffMember.name}
                    className="w-11 h-11 rounded-full border-2 border-purple-200/60 shadow-sm"
                  />
                  <div className={isRTL ? 'text-right' : ''}>
                    <h3 className={`font-semibold text-gray-800 text-base ${isRTL ? 'font-arabic' : ''}`}>
                      {staffMember.name}
                    </h3>
                    <p className={`text-sm text-gray-600 ${isRTL ? 'font-arabic' : ''}`}>
                      {staffMember.rating}⭐ • {staffMember.efficiency}% • {(staffMember.specialties || []).join(", ")}
                    </p>
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
                className={`grid grid-cols-[180px_repeat(${staff.length},1fr)] hover:bg-purple-50/20 transition-colors duration-150`}
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
                    <EnhancedGridCell
                      timeSlot={timeSlot}
                      staff={staffMember}
                      appointments={appointments}
                      date={date}
                      appointmentConflicts={appointmentConflicts}
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
              <EnhancedAppointmentBlock 
                appointment={draggedAppointment} 
                isDragging 
                conflicts={appointmentConflicts[draggedAppointment.id || '']}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default EnhancedScheduler;
