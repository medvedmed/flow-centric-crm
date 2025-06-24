
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, Clock, Save, RefreshCw } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
  break_start?: string;
  break_end?: string;
  status: string;
}

interface StaffAvailability {
  id?: string;
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  reason?: string;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const RealTimeStaffScheduleManager: React.FC = () => {
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [editingSchedule, setEditingSchedule] = useState<StaffMember | null>(null);
  const [customAvailability, setCustomAvailability] = useState<Record<string, StaffAvailability>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staff members
  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['staff-for-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data as StaffMember[];
    }
  });

  // Fetch staff availability for the selected week
  const { data: availability = [] } = useQuery({
    queryKey: ['staff-availability', selectedStaff, format(selectedWeek, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!selectedStaff) return [];

      const weekEnd = addDays(selectedWeek, 6);
      const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', selectedStaff)
        .gte('date', format(selectedWeek, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));

      if (error) throw error;
      return data as StaffAvailability[];
    },
    enabled: !!selectedStaff
  });

  // Update staff working hours
  const updateStaffMutation = useMutation({
    mutationFn: async (updatedStaff: Partial<StaffMember> & { id: string }) => {
      const { error } = await supabase
        .from('staff')
        .update({
          working_hours_start: updatedStaff.working_hours_start,
          working_hours_end: updatedStaff.working_hours_end,
          working_days: updatedStaff.working_days,
          break_start: updatedStaff.break_start,
          break_end: updatedStaff.break_end,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedStaff.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-for-schedule'] });
      toast({
        title: "Schedule Updated",
        description: "Staff working hours have been updated successfully.",
      });
      setEditingSchedule(null);
    }
  });

  // Save custom availability
  const saveAvailabilityMutation = useMutation({
    mutationFn: async (availabilityData: StaffAvailability) => {
      if (availabilityData.id) {
        // Update existing
        const { error } = await supabase
          .from('staff_availability')
          .update({
            start_time: availabilityData.start_time,
            end_time: availabilityData.end_time,
            is_available: availabilityData.is_available,
            reason: availabilityData.reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', availabilityData.id);

        if (error) throw error;
      } else {
        // Create new
        const { data: user } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('staff_availability')
          .insert({
            staff_id: availabilityData.staff_id,
            salon_id: user.user?.id,
            date: availabilityData.date,
            start_time: availabilityData.start_time,
            end_time: availabilityData.end_time,
            is_available: availabilityData.is_available,
            reason: availabilityData.reason
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
      toast({
        title: "Availability Updated",
        description: "Staff availability has been saved successfully.",
      });
    }
  });

  const selectedStaffMember = staff.find(s => s.id === selectedStaff);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(selectedWeek, i));

  const getAvailabilityForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return availability.find(a => a.date === dateString);
  };

  const handleSaveSchedule = () => {
    if (editingSchedule) {
      updateStaffMutation.mutate(editingSchedule);
    }
  };

  const handleCustomAvailabilityChange = (date: string, field: keyof StaffAvailability, value: any) => {
    setCustomAvailability(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        staff_id: selectedStaff,
        date,
        [field]: value
      }
    }));
  };

  const saveCustomAvailability = (date: string) => {
    const availabilityData = customAvailability[date];
    if (availabilityData) {
      const existingAvailability = getAvailabilityForDate(new Date(date));
      saveAvailabilityMutation.mutate({
        ...availabilityData,
        id: existingAvailability?.id
      });
    }
  };

  if (staffLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading staff schedules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Real-Time Staff Schedule Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Staff Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="staff-select">Select Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="week-select">Select Week</Label>
              <Input
                type="date"
                value={format(selectedWeek, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedWeek(startOfWeek(new Date(e.target.value), { weekStartsOn: 1 }))}
              />
            </div>
          </div>

          {/* Default Working Hours */}
          {selectedStaffMember && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Default Working Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={editingSchedule?.working_hours_start || selectedStaffMember.working_hours_start || '09:00'}
                      onChange={(e) => setEditingSchedule(prev => ({
                        ...prev,
                        ...selectedStaffMember,
                        working_hours_start: e.target.value
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={editingSchedule?.working_hours_end || selectedStaffMember.working_hours_end || '17:00'}
                      onChange={(e) => setEditingSchedule(prev => ({
                        ...prev,
                        ...selectedStaffMember,
                        working_hours_end: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Break Start</Label>
                    <Input
                      type="time"
                      value={editingSchedule?.break_start || selectedStaffMember.break_start || '12:00'}
                      onChange={(e) => setEditingSchedule(prev => ({
                        ...prev,
                        ...selectedStaffMember,
                        break_start: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Break End</Label>
                    <Input
                      type="time"
                      value={editingSchedule?.break_end || selectedStaffMember.break_end || '13:00'}
                      onChange={(e) => setEditingSchedule(prev => ({
                        ...prev,
                        ...selectedStaffMember,
                        break_end: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={editingSchedule?.working_days?.includes(day) || selectedStaffMember.working_days?.includes(day) || false}
                          onCheckedChange={(checked) => {
                            const currentDays = editingSchedule?.working_days || selectedStaffMember.working_days || [];
                            const newDays = checked 
                              ? [...currentDays, day]
                              : currentDays.filter(d => d !== day);
                            
                            setEditingSchedule(prev => ({
                              ...prev,
                              ...selectedStaffMember,
                              working_days: newDays
                            }));
                          }}
                        />
                        <Label htmlFor={day} className="text-sm">{day.slice(0, 3)}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSaveSchedule}
                  disabled={updateStaffMutation.isPending}
                  className="mt-4"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateStaffMutation.isPending ? 'Saving...' : 'Save Schedule'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Weekly Custom Availability */}
          {selectedStaffMember && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Week of {format(selectedWeek, 'MMM d, yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weekDays.map((day) => {
                    const dateString = format(day, 'yyyy-MM-dd');
                    const dayName = format(day, 'EEEE');
                    const existingAvailability = getAvailabilityForDate(day);
                    const customAv = customAvailability[dateString];

                    return (
                      <div key={dateString} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">
                            {dayName}, {format(day, 'MMM d')}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={customAv?.is_available ?? existingAvailability?.is_available ?? true}
                              onCheckedChange={(checked) => 
                                handleCustomAvailabilityChange(dateString, 'is_available', checked)
                              }
                            />
                            <Label className="text-sm">Available</Label>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm">Start Time</Label>
                            <Input
                              type="time"
                              value={customAv?.start_time ?? existingAvailability?.start_time ?? selectedStaffMember.working_hours_start ?? '09:00'}
                              onChange={(e) => 
                                handleCustomAvailabilityChange(dateString, 'start_time', e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label className="text-sm">End Time</Label>
                            <Input
                              type="time"
                              value={customAv?.end_time ?? existingAvailability?.end_time ?? selectedStaffMember.working_hours_end ?? '17:00'}
                              onChange={(e) => 
                                handleCustomAvailabilityChange(dateString, 'end_time', e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label className="text-sm">Reason (if unavailable)</Label>
                            <Input
                              placeholder="e.g., Sick leave, Holiday"
                              value={customAv?.reason ?? existingAvailability?.reason ?? ''}
                              onChange={(e) => 
                                handleCustomAvailabilityChange(dateString, 'reason', e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => saveCustomAvailability(dateString)}
                          disabled={saveAvailabilityMutation.isPending}
                          className="mt-3"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save Day
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStaffScheduleManager;
