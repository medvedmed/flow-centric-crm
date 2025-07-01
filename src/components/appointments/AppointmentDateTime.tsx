
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AppointmentDateTimeProps {
  date: string;
  startTime: string;
  endTime: string;
}

export const AppointmentDateTime: React.FC<AppointmentDateTimeProps> = ({
  date,
  startTime,
  endTime
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={date}
          required
        />
      </div>
      <div>
        <Label htmlFor="start_time">Start Time</Label>
        <Input
          id="start_time"
          name="start_time"
          type="time"
          defaultValue={startTime}
          required
        />
      </div>
      <div>
        <Label htmlFor="end_time">End Time</Label>
        <Input
          id="end_time"
          name="end_time"
          type="time"
          defaultValue={endTime}
          required
        />
      </div>
    </div>
  );
};
