import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddAppointmentDialog } from '../AddAppointmentDialog';
interface EmptyTimeSlotProps {
  staffId: string;
  time: string;
  selectedDate: Date;
  onTimeSlotClick?: (staffId: string, time: string) => void;
}
export const EmptyTimeSlot: React.FC<EmptyTimeSlotProps> = ({
  staffId,
  time,
  selectedDate,
  onTimeSlotClick
}) => {
  return <div className="h-16 w-full flex items-center justify-center hover:bg-gray-50/50 transition-colors rounded mx-[88px]">
      <AddAppointmentDialog selectedDate={selectedDate} selectedTime={time} selectedStaffId={staffId} trigger={<Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-200/60" onClick={() => onTimeSlotClick?.(staffId, time)}>
            <Plus className="w-3 h-3 text-gray-400" />
          </Button>} />
    </div>;
};