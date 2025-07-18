
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { format, addMinutes, startOfDay } from 'date-fns';

interface ClickToBookSchedulerProps {
  selectedDate: Date;
  staff: any[];
  appointments: any[];
  onTimeSlotClick?: (date: Date, time: string, staffId?: string) => void;
}

export const ClickToBookScheduler: React.FC<ClickToBookSchedulerProps> = ({
  selectedDate,
  staff,
  appointments,
  onTimeSlotClick
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: Date;
    time: string;
    staffId?: string;
  } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Generate time slots for the day (9 AM to 8 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = new Date(selectedDate);
    startTime.setHours(9, 0, 0, 0);
    
    for (let i = 0; i < 22; i++) { // 11 hours * 2 slots per hour
      const slotTime = addMinutes(startTime, i * 30);
      slots.push(format(slotTime, 'HH:mm'));
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotClick = (time: string, staffId?: string) => {
    const slotData = {
      date: selectedDate,
      time,
      staffId
    };
    
    setSelectedTimeSlot(slotData);
    setShowAddDialog(true);
    
    if (onTimeSlotClick) {
      onTimeSlotClick(selectedDate, time, staffId);
    }
  };

  const isSlotOccupied = (time: string, staffId?: string) => {
    return appointments.some(apt => {
      const aptStartTime = format(new Date(`2000-01-01 ${apt.start_time}`), 'HH:mm');
      const aptEndTime = format(new Date(`2000-01-01 ${apt.end_time}`), 'HH:mm');
      const slotTime = time;
      
      const matchesStaff = !staffId || apt.staff_id === staffId;
      const isInTimeRange = slotTime >= aptStartTime && slotTime < aptEndTime;
      
      return matchesStaff && isInTimeRange;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Click any time slot to book an appointment
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Time slots for all staff */}
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {staff.map((staffMember) => (
                <div key={staffMember.id} className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-center bg-gradient-to-r from-violet-100 to-blue-100 py-2 rounded-lg">
                    {staffMember.name}
                  </h4>
                  <div className="grid grid-cols-4 gap-1">
                    {timeSlots.map((time) => {
                      const isOccupied = isSlotOccupied(time, staffMember.id);
                      return (
                        <Button
                          key={`${staffMember.id}-${time}`}
                          variant={isOccupied ? "secondary" : "outline"}
                          size="sm"
                          disabled={isOccupied}
                          onClick={() => handleTimeSlotClick(time, staffMember.id)}
                          className={`
                            h-8 text-xs font-normal transition-all duration-200
                            ${isOccupied 
                              ? 'bg-red-100 text-red-700 border-red-200 cursor-not-allowed' 
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:scale-105'
                            }
                          `}
                        >
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* General time slots */}
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-center bg-gradient-to-r from-gray-100 to-slate-100 py-2 rounded-lg">
              Any Staff Member
            </h4>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {timeSlots.map((time) => {
                const isAnySlotOccupied = staff.some(s => isSlotOccupied(time, s.id));
                return (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTimeSlotClick(time)}
                    className={`
                      h-10 text-xs font-normal transition-all duration-200
                      ${isAnySlotOccupied 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' 
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:scale-105'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <span>{time}</span>
                      {isAnySlotOccupied && (
                        <span className="text-xs opacity-70">Partial</span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Appointment Dialog */}
      <AddAppointmentDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setSelectedTimeSlot(null);
        }}
        selectedDate={selectedTimeSlot?.date || selectedDate}
        initialTime={selectedTimeSlot?.time}
        initialStaffId={selectedTimeSlot?.staffId}
      />
    </div>
  );
};
