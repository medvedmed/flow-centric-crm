
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Palette } from 'lucide-react';
import { Appointment } from '@/services/types';

interface SchedulingSectionProps {
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: Appointment['status'];
  appointmentColor: string;
  onDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onStatusChange: (status: Appointment['status']) => void;
  onColorChange: (color: string) => void;
}

export const SchedulingSection: React.FC<SchedulingSectionProps> = ({
  appointmentDate,
  startTime,
  endTime,
  status,
  appointmentColor,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onStatusChange,
  onColorChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <h3 className="font-semibold">Scheduling</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={appointmentDate}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="No Show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="color">Appointment Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="color"
              type="color"
              value={appointmentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-20 h-10"
            />
            <Palette className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
