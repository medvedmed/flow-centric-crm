
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface StaffAvailability {
  id: string;
  staffId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isAvailable: boolean;
}

interface TimeOffRequest {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
}

interface StaffAvailabilityProps {
  staffId: string;
  staffName: string;
}

const StaffAvailability: React.FC<StaffAvailabilityProps> = ({ staffId, staffName }) => {
  const [availability, setAvailability] = useState<StaffAvailability[]>([
    {
      id: '1',
      staffId,
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      isAvailable: true
    }
  ]);

  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [isRequestingTimeOff, setIsRequestingTimeOff] = useState(false);

  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: '',
    startTime: '09:00',
    endTime: '17:00',
    breakStart: '12:00',
    breakEnd: '13:00',
    isAvailable: true
  });

  const [newTimeOff, setNewTimeOff] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddAvailability = () => {
    if (!newAvailability.dayOfWeek) return;

    const newEntry: StaffAvailability = {
      id: Date.now().toString(),
      staffId,
      ...newAvailability
    };

    setAvailability([...availability, newEntry]);
    setNewAvailability({
      dayOfWeek: '',
      startTime: '09:00',
      endTime: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      isAvailable: true
    });
    setIsAddingAvailability(false);
  };

  const handleRequestTimeOff = () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate || !newTimeOff.reason) return;

    const request: TimeOffRequest = {
      id: Date.now().toString(),
      staffId,
      ...newTimeOff,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setTimeOffRequests([...timeOffRequests, request]);
    setNewTimeOff({
      startDate: '',
      endDate: '',
      reason: ''
    });
    setIsRequestingTimeOff(false);
  };

  const removeAvailability = (id: string) => {
    setAvailability(availability.filter(a => a.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setAvailability(availability.map(a => 
      a.id === id ? { ...a, isAvailable: !a.isAvailable } : a
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly Availability */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Weekly Availability - {staffName}
            </CardTitle>
            <Dialog open={isAddingAvailability} onOpenChange={setIsAddingAvailability}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Availability</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Day of Week</Label>
                    <Select onValueChange={(value) => setNewAvailability({...newAvailability, dayOfWeek: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {daysOfWeek.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newAvailability.startTime}
                        onChange={(e) => setNewAvailability({...newAvailability, startTime: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newAvailability.endTime}
                        onChange={(e) => setNewAvailability({...newAvailability, endTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Break Start</Label>
                      <Input
                        type="time"
                        value={newAvailability.breakStart}
                        onChange={(e) => setNewAvailability({...newAvailability, breakStart: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Break End</Label>
                      <Input
                        type="time"
                        value={newAvailability.breakEnd}
                        onChange={(e) => setNewAvailability({...newAvailability, breakEnd: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddAvailability} className="w-full">
                    Add Availability
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {daysOfWeek.map(day => {
              const dayAvailability = availability.filter(a => a.dayOfWeek === day);
              return (
                <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium w-20">{day}</span>
                    {dayAvailability.length === 0 ? (
                      <Badge variant="secondary">Not Available</Badge>
                    ) : (
                      dayAvailability.map(avail => (
                        <div key={avail.id} className="flex items-center gap-2">
                          <Badge 
                            variant={avail.isAvailable ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleAvailability(avail.id)}
                          >
                            {avail.startTime} - {avail.endTime}
                            {avail.breakStart && ` (Break: ${avail.breakStart}-${avail.breakEnd})`}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAvailability(avail.id)}
                          >
                            <Trash className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Off Requests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Time Off Requests
            </CardTitle>
            <Dialog open={isRequestingTimeOff} onOpenChange={setIsRequestingTimeOff}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Time Off
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Time Off</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newTimeOff.startDate}
                        onChange={(e) => setNewTimeOff({...newTimeOff, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={newTimeOff.endDate}
                        onChange={(e) => setNewTimeOff({...newTimeOff, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <Input
                      value={newTimeOff.reason}
                      onChange={(e) => setNewTimeOff({...newTimeOff, reason: e.target.value})}
                      placeholder="Vacation, sick leave, personal..."
                    />
                  </div>
                  <Button onClick={handleRequestTimeOff} className="w-full">
                    Submit Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {timeOffRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No time off requests</p>
          ) : (
            <div className="space-y-3">
              {timeOffRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{request.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.startDate} to {request.endDate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAvailability;
