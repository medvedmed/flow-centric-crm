
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';

interface ScheduleSettingsDialogProps {
  startHour: number;
  endHour: number;
  onTimeRangeChange: (startHour: number, endHour: number) => void;
}

export const ScheduleSettingsDialog: React.FC<ScheduleSettingsDialogProps> = ({
  startHour,
  endHour,
  onTimeRangeChange
}) => {
  const [tempStartHour, setTempStartHour] = useState(startHour);
  const [tempEndHour, setTempEndHour] = useState(endHour);
  const [isOpen, setIsOpen] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleSave = () => {
    if (tempEndHour > tempStartHour) {
      onTimeRangeChange(tempStartHour, tempEndHour);
      setIsOpen(false);
    }
  };

  const formatHourDisplay = (hour: number) => {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour12} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Settings className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Hours</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Select value={tempStartHour.toString()} onValueChange={(value) => setTempStartHour(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.slice(0, 22).map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {formatHourDisplay(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <Select value={tempEndHour.toString()} onValueChange={(value) => setTempEndHour(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hours.slice(tempStartHour + 1, 24).map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {formatHourDisplay(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={tempEndHour <= tempStartHour}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
