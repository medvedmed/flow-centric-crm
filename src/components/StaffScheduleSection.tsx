
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Users, Save, Edit, Trash2 } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  schedule: { [key: string]: { start: string; end: string; isWorking: boolean } };
}

interface BulkEditSession {
  selectedDays: string[];
  selectedStaff: string[];
  workingHours: { start: string; end: string };
}

export const StaffScheduleSection: React.FC = () => {
  const { toast } = useToast();
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEdit, setBulkEdit] = useState<BulkEditSession>({
    selectedDays: [],
    selectedStaff: [],
    workingHours: { start: '09:00', end: '17:00' }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Stylist',
      schedule: {
        Monday: { start: '09:00', end: '17:00', isWorking: true },
        Tuesday: { start: '09:00', end: '17:00', isWorking: true },
        Wednesday: { start: '09:00', end: '17:00', isWorking: true },
        Thursday: { start: '09:00', end: '17:00', isWorking: true },
        Friday: { start: '09:00', end: '17:00', isWorking: true },
        Saturday: { start: '10:00', end: '16:00', isWorking: true },
        Sunday: { start: '00:00', end: '00:00', isWorking: false }
      }
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Barber',
      schedule: {
        Monday: { start: '00:00', end: '00:00', isWorking: false },
        Tuesday: { start: '10:00', end: '18:00', isWorking: true },
        Wednesday: { start: '10:00', end: '18:00', isWorking: true },
        Thursday: { start: '10:00', end: '18:00', isWorking: true },
        Friday: { start: '10:00', end: '18:00', isWorking: true },
        Saturday: { start: '09:00', end: '17:00', isWorking: true },
        Sunday: { start: '11:00', end: '15:00', isWorking: true }
      }
    },
    {
      id: '3',
      name: 'Emma Davis',
      role: 'Nail Technician',
      schedule: {
        Monday: { start: '08:00', end: '16:00', isWorking: true },
        Tuesday: { start: '08:00', end: '16:00', isWorking: true },
        Wednesday: { start: '08:00', end: '16:00', isWorking: true },
        Thursday: { start: '08:00', end: '16:00', isWorking: true },
        Friday: { start: '08:00', end: '16:00', isWorking: true },
        Saturday: { start: '00:00', end: '00:00', isWorking: false },
        Sunday: { start: '00:00', end: '00:00', isWorking: false }
      }
    }
  ]);

  const toggleDaySelection = (day: string) => {
    setBulkEdit(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const toggleStaffSelection = (staffId: string) => {
    setBulkEdit(prev => ({
      ...prev,
      selectedStaff: prev.selectedStaff.includes(staffId)
        ? prev.selectedStaff.filter(s => s !== staffId)
        : [...prev.selectedStaff, staffId]
    }));
  };

  const applyBulkEdit = () => {
    if (bulkEdit.selectedDays.length === 0 || bulkEdit.selectedStaff.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select both staff members and days to apply changes",
        variant: "destructive",
      });
      return;
    }

    setStaffMembers(prev => prev.map(staff => {
      if (bulkEdit.selectedStaff.includes(staff.id)) {
        const updatedSchedule = { ...staff.schedule };
        bulkEdit.selectedDays.forEach(day => {
          updatedSchedule[day] = {
            start: bulkEdit.workingHours.start,
            end: bulkEdit.workingHours.end,
            isWorking: true
          };
        });
        return { ...staff, schedule: updatedSchedule };
      }
      return staff;
    }));

    setBulkEdit({
      selectedDays: [],
      selectedStaff: [],
      workingHours: { start: '09:00', end: '17:00' }
    });
    setBulkEditMode(false);

    toast({
      title: "Schedule Updated",
      description: `Applied working hours to ${bulkEdit.selectedStaff.length} staff members for ${bulkEdit.selectedDays.length} days`,
    });
  };

  const updateIndividualSchedule = (staffId: string, day: string, schedule: { start: string; end: string; isWorking: boolean }) => {
    setStaffMembers(prev => prev.map(staff => {
      if (staff.id === staffId) {
        return {
          ...staff,
          schedule: {
            ...staff.schedule,
            [day]: schedule
          }
        };
      }
      return staff;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Bulk Edit Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Bulk Schedule Editor
            </CardTitle>
            <Button 
              variant={bulkEditMode ? "secondary" : "default"}
              onClick={() => setBulkEditMode(!bulkEditMode)}
            >
              {bulkEditMode ? 'Cancel' : 'Bulk Edit'}
            </Button>
          </div>
        </CardHeader>
        {bulkEditMode && (
          <CardContent className="space-y-4">
            {/* Staff Selection */}
            <div>
              <Label>Select Staff Members</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {staffMembers.map(staff => (
                  <Badge
                    key={staff.id}
                    variant={bulkEdit.selectedStaff.includes(staff.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStaffSelection(staff.id)}
                  >
                    {staff.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Day Selection */}
            <div>
              <Label>Select Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {days.map(day => (
                  <Badge
                    key={day}
                    variant={bulkEdit.selectedDays.includes(day) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleDaySelection(day)}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulkStart">Start Time</Label>
                <Input
                  id="bulkStart"
                  type="time"
                  value={bulkEdit.workingHours.start}
                  onChange={(e) => setBulkEdit(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="bulkEnd">End Time</Label>
                <Input
                  id="bulkEnd"
                  type="time"
                  value={bulkEdit.workingHours.end}
                  onChange={(e) => setBulkEdit(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                />
              </div>
            </div>

            <Button onClick={applyBulkEdit} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Apply to Selected Days & Staff
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Staff Schedule Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="font-semibold text-sm">Staff</div>
                {days.map(day => (
                  <div key={day} className="font-semibold text-sm text-center">{day.slice(0, 3)}</div>
                ))}
              </div>

              {/* Staff Rows */}
              {staffMembers.map(staff => (
                <div key={staff.id} className="grid grid-cols-8 gap-2 mb-3 items-center">
                  <div className="pr-2">
                    <p className="font-medium text-sm">{staff.name}</p>
                    <p className="text-xs text-gray-500">{staff.role}</p>
                  </div>
                  {days.map(day => {
                    const daySchedule = staff.schedule[day];
                    return (
                      <div key={day} className="text-center">
                        {daySchedule.isWorking ? (
                          <div className="bg-green-50 border border-green-200 rounded p-1">
                            <p className="text-xs text-green-800 font-medium">
                              {daySchedule.start} - {daySchedule.end}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded p-1">
                            <p className="text-xs text-gray-500">Off</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Schedule Cards */}
      <div className="grid gap-4">
        {staffMembers.map(staff => (
          <Card key={staff.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                {staff.name} - {staff.role}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {days.map(day => {
                  const daySchedule = staff.schedule[day];
                  return (
                    <div key={day} className="space-y-2">
                      <Label className="text-sm font-medium">{day}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={daySchedule.isWorking}
                          onChange={(e) => updateIndividualSchedule(staff.id, day, {
                            ...daySchedule,
                            isWorking: e.target.checked
                          })}
                          className="rounded"
                        />
                        {daySchedule.isWorking && (
                          <div className="flex gap-1 text-xs">
                            <Input
                              type="time"
                              value={daySchedule.start}
                              onChange={(e) => updateIndividualSchedule(staff.id, day, {
                                ...daySchedule,
                                start: e.target.value
                              })}
                              className="h-7 text-xs"
                            />
                            <Input
                              type="time"
                              value={daySchedule.end}
                              onChange={(e) => updateIndividualSchedule(staff.id, day, {
                                ...daySchedule,
                                end: e.target.value
                              })}
                              className="h-7 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
