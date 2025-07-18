
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Staff {
  id: string;
  name: string;
  specialties?: string[];
}

interface AppointmentTopBarProps {
  selectedStaff: string;
  onStaffChange: (staffId: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  endTime: string;
  onEndTimeChange: (time: string) => void;
  staff: Staff[];
}

export const AppointmentTopBar: React.FC<AppointmentTopBarProps> = ({
  selectedStaff,
  onStaffChange,
  selectedDate,
  onDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  staff
}) => {
  return (
    <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          {/* Staff Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
              <Users className="w-4 h-4 text-violet-600" />
              Specialist
            </Label>
            <Select value={selectedStaff} onValueChange={onStaffChange}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select specialist" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{member.name}</span>
                      {member.specialties && member.specialties.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {member.specialties.join(', ')}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
              <CalendarIcon className="w-4 h-4 text-violet-600" />
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Start Time */}
          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
              <Clock className="w-4 h-4 text-violet-600" />
              Start Time
            </Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="w-full bg-white"
            />
          </div>

          {/* End Time */}
          <div>
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
              <Clock className="w-4 h-4 text-violet-600" />
              End Time
            </Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className="w-full bg-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
