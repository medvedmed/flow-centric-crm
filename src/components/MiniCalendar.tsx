
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isToday, isSameDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface MiniCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointmentDates?: Date[];
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onDateSelect,
  appointmentDates = []
}) => {
  const modifiers = {
    today: isToday,
    selected: (date: Date) => isSameDay(date, selectedDate),
    hasAppointments: (date: Date) => 
      appointmentDates.some(appDate => isSameDay(date, appDate))
  };

  const modifiersStyles = {
    today: {
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: 'bold'
    },
    selected: {
      backgroundColor: '#059669',
      color: 'white'
    },
    hasAppointments: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      fontWeight: '500'
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="w-5 h-5" />
          Calendar
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="rounded-md border"
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
        
        {/* Legend */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-600"></div>
            <span>Selected</span>
          </div>
          {appointmentDates.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-600"></div>
              <span>Has appointments</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
