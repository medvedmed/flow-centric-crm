
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { timeUtils } from '@/utils/timeUtils';

interface TimeSelectorProps {
  value: string;
  onValueChange: (time: string) => void;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
  placeholder?: string;
  disabled?: boolean;
  filterAvailable?: (time: string) => boolean;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  value,
  onValueChange,
  startHour = 8,
  endHour = 20,
  intervalMinutes = 15,
  placeholder = "Select time",
  disabled = false,
  filterAvailable
}) => {
  const timeSlots = timeUtils.generateTimeSlots(startHour, endHour, intervalMinutes);
  const availableSlots = filterAvailable 
    ? timeSlots.filter(filterAvailable)
    : timeSlots;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {availableSlots.length === 0 ? (
          <SelectItem value="no-slots" disabled>No available time slots</SelectItem>
        ) : (
          availableSlots.map((time) => (
            <SelectItem key={time} value={time}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{time}</span>
                <span className="text-xs text-muted-foreground">
                  ({timeUtils.formatTimeForDisplay(time)})
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
