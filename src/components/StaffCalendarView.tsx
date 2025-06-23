import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Staff {
  id: string;
  name: string;
  image: string;
  specialties: string[];
}

interface CalendarEvent {
  id: string;
  staffId: string;
  title: string;
  start: string;
  end: string;
  type: 'appointment' | 'break' | 'timeoff' | 'blocked';
  clientName?: string;
  service?: string;
  color?: string;
}

interface StaffCalendarViewProps {
  staff: {
    id: string;
    name: string;
    email?: string;
    imageUrl?: string;
    specialties: string[];
  }[];
  events: {
    id: string;
    staffId: string;
    title: string;
    start: string;
    end: string;
    type: 'appointment' | 'break' | 'timeoff' | 'blocked';
    clientName?: string;
    service?: string;
    color?: string;
  }[];
  onAddEvent?: (event: any) => void;
}

const StaffCalendarView: React.FC<StaffCalendarViewProps> = ({ 
  staff, 
  events, 
  onAddEvent 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [newBlock, setNewBlock] = useState({
    title: '',
    start: '',
    end: '',
    type: 'blocked' as const
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getEventsForStaffAndTime = (staffId: string, timeSlot: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => 
      event.staffId === staffId && 
      event.start.includes(dateStr) &&
      event.start.includes(timeSlot)
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'break': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'timeoff': return 'bg-red-100 text-red-800 border-red-200';
      case 'blocked': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddBlock = () => {
    if (!selectedStaff || !newBlock.title || !newBlock.start || !newBlock.end) return;

    const dateStr = currentDate.toISOString().split('T')[0];
    const event = {
      staffId: selectedStaff,
      title: newBlock.title,
      start: `${dateStr}T${newBlock.start}:00`,
      end: `${dateStr}T${newBlock.end}:00`,
      type: newBlock.type
    };

    onAddEvent?.(event);
    setNewBlock({ title: '', start: '', end: '', type: 'blocked' });
    setSelectedStaff('');
    setIsAddingBlock(false);
  };

  const weekDates = getWeekDates(currentDate);
  const timeSlots = getTimeSlots();

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Staff Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium px-4">
                {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Dialog open={isAddingBlock} onOpenChange={setIsAddingBlock}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Block Time
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Block Time Slot</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Staff Member</Label>
                      <Select onValueChange={setSelectedStaff}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newBlock.title}
                        onChange={(e) => setNewBlock({...newBlock, title: e.target.value})}
                        placeholder="Break, Meeting, Training..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={newBlock.start}
                          onChange={(e) => setNewBlock({...newBlock, start: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={newBlock.end}
                          onChange={(e) => setNewBlock({...newBlock, end: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select onValueChange={(value: any) => setNewBlock({...newBlock, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="break">Break</SelectItem>
                          <SelectItem value="timeoff">Time Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddBlock} className="w-full">
                      Block Time
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 bg-gray-50 border-r">
              <span className="text-sm font-medium">Time</span>
            </div>
            {weekDates.map((date, index) => (
              <div key={index} className="p-3 bg-gray-50 border-r last:border-r-0">
                <div className="text-sm font-medium">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="text-xs text-muted-foreground">{date.getDate()}</div>
              </div>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className="grid grid-cols-8 border-b last:border-b-0">
                <div className="p-2 border-r bg-gray-50">
                  <span className="text-sm">{timeSlot}</span>
                </div>
                {weekDates.map((date, dateIndex) => (
                  <div key={`${timeSlot}-${dateIndex}`} className="border-r last:border-r-0 min-h-16">
                    <div className="grid gap-1 p-1">
                      {staff.map(member => {
                        const staffEvents = getEventsForStaffAndTime(member.id, timeSlot, date);
                        return staffEvents.map(event => (
                          <div
                            key={event.id}
                            className={`p-1 rounded text-xs border ${getEventTypeColor(event.type)}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            {event.clientName && (
                              <div className="truncate">{event.clientName}</div>
                            )}
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staff Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium">Staff:</span>
            {staff.map(member => (
              <div key={member.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">{member.name}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-wrap mt-2">
            <span className="text-sm font-medium">Types:</span>
            <Badge className="bg-blue-100 text-blue-800">Appointment</Badge>
            <Badge className="bg-gray-100 text-gray-800">Break</Badge>
            <Badge className="bg-red-100 text-red-800">Time Off</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">Blocked</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffCalendarView;
