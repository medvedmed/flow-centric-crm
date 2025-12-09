
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Users, Save, Edit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  working_hours_start?: string;
  working_hours_end?: string;
  working_days?: string[];
  break_start?: string;
  break_end?: string;
}

interface BulkEditSession {
  selectedDays: string[];
  selectedStaff: string[];
  workingHours: { start: string; end: string };
}

export const StaffScheduleSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEdit, setBulkEdit] = useState<BulkEditSession>({
    selectedDays: [],
    selectedStaff: [],
    workingHours: { start: '09:00', end: '17:00' }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch staff data
  const { data: staffData = [], isLoading } = useQuery({
    queryKey: ['staff-schedule', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return (data || []).map(staff => ({
        ...staff,
        role: 'staff' as const
      })) as StaffMember[];
    },
    enabled: !!user,
  });

  // Update staff working hours mutation
  const updateStaffMutation = useMutation({
    mutationFn: async ({ staffId, updates }: { staffId: string; updates: Partial<StaffMember> }) => {
      const { error } = await supabase
        .from('staff')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', staffId)
        .eq('salon_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-schedule'] });
      toast({
        title: "Success",
        description: "Staff schedule updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating staff schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update staff schedule",
        variant: "destructive",
      });
    }
  });

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

  const applyBulkEdit = async () => {
    if (bulkEdit.selectedDays.length === 0 || bulkEdit.selectedStaff.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select both staff members and days to apply changes",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const staffId of bulkEdit.selectedStaff) {
        await updateStaffMutation.mutateAsync({
          staffId,
          updates: {
            working_hours_start: bulkEdit.workingHours.start + ':00',
            working_hours_end: bulkEdit.workingHours.end + ':00',
            working_days: bulkEdit.selectedDays
          }
        });
      }

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
    } catch (error) {
      console.error('Error applying bulk edit:', error);
    }
  };

  const updateIndividualSchedule = async (staffId: string, field: string, value: any) => {
    const updates: any = {};
    
    if (field === 'working_hours_start' || field === 'working_hours_end') {
      updates[field] = value + ':00';
    } else if (field === 'working_days') {
      updates[field] = value;
    } else {
      updates[field] = value;
    }

    await updateStaffMutation.mutateAsync({ staffId, updates });
  };

  const getWorkingDaysForStaff = (staff: StaffMember): string[] => {
    return staff.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  };

  const getWorkingHoursForStaff = (staff: StaffMember) => {
    return {
      start: staff.working_hours_start?.slice(0, 5) || '09:00',
      end: staff.working_hours_end?.slice(0, 5) || '17:00'
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                {staffData.map(staff => (
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

            <Button 
              onClick={applyBulkEdit} 
              className="w-full"
              disabled={updateStaffMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateStaffMutation.isPending ? "Applying..." : "Apply to Selected Days & Staff"}
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
              {staffData.map(staff => {
                const workingDays = getWorkingDaysForStaff(staff);
                const workingHours = getWorkingHoursForStaff(staff);
                
                return (
                  <div key={staff.id} className="grid grid-cols-8 gap-2 mb-3 items-center">
                    <div className="pr-2">
                      <p className="font-medium text-sm">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.role || 'Staff Member'}</p>
                    </div>
                    {days.map(day => {
                      const isWorkingDay = workingDays.includes(day);
                      return (
                        <div key={day} className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <input
                              type="checkbox"
                              checked={isWorkingDay}
                              onChange={(e) => {
                                const newWorkingDays = e.target.checked
                                  ? [...workingDays, day]
                                  : workingDays.filter(d => d !== day);
                                updateIndividualSchedule(staff.id, 'working_days', newWorkingDays);
                              }}
                              className="rounded"
                            />
                          </div>
                          {isWorkingDay ? (
                            <div className="bg-green-50 border border-green-200 rounded p-1">
                              <div className="space-y-1">
                                <Input
                                  type="time"
                                  value={workingHours.start}
                                  onChange={(e) => updateIndividualSchedule(staff.id, 'working_hours_start', e.target.value)}
                                  className="h-6 text-xs"
                                />
                                <Input
                                  type="time"
                                  value={workingHours.end}
                                  onChange={(e) => updateIndividualSchedule(staff.id, 'working_hours_end', e.target.value)}
                                  className="h-6 text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-muted border border-border rounded p-1">
                              <p className="text-xs text-muted-foreground">Off</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Schedule Management */}
      <div className="grid gap-4">
        {staffData.map(staff => {
          const workingHours = getWorkingHoursForStaff(staff);
          
          return (
            <Card key={staff.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  {staff.name} - Schedule Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Default Working Hours</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="time"
                        value={workingHours.start}
                        onChange={(e) => updateIndividualSchedule(staff.id, 'working_hours_start', e.target.value)}
                        className="flex-1"
                      />
                      <span className="self-center">to</span>
                      <Input
                        type="time"
                        value={workingHours.end}
                        onChange={(e) => updateIndividualSchedule(staff.id, 'working_hours_end', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Break Time</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="time"
                        value={staff.break_start?.slice(0, 5) || '12:00'}
                        onChange={(e) => updateIndividualSchedule(staff.id, 'break_start', e.target.value)}
                        className="flex-1"
                      />
                      <span className="self-center">to</span>
                      <Input
                        type="time"
                        value={staff.break_end?.slice(0, 5) || '13:00'}
                        onChange={(e) => updateIndividualSchedule(staff.id, 'break_end', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
