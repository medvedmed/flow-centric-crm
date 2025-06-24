
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Clock, Plus, Edit, Trash, Check, X, AlertCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { useStaff } from '@/hooks/staff/useStaffHooks';
import {
  useStaffAvailability,
  useCreateStaffAvailability,
  useUpdateStaffAvailability,
  useDeleteStaffAvailability,
  useBulkCreateAvailability,
  useCheckAvailability
} from '@/hooks/availability/useStaffAvailabilityHooks';
import { StaffAvailability, Staff } from '@/services/types';
import { toast } from '@/hooks/use-toast';

interface StaffAvailabilityManagerProps {
  staffId?: string;
  showStaffSelector?: boolean;
}

export const StaffAvailabilityManager: React.FC<StaffAvailabilityManagerProps> = ({
  staffId,
  showStaffSelector = true
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffId || '');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<StaffAvailability | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'week' | 'list'>('week');

  const [newAvailability, setNewAvailability] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
    reason: ''
  });

  // Fetch data
  const { data: staffData } = useStaff();
  const staff = staffData?.data || [];

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: availabilityData, isLoading } = useStaffAvailability(
    selectedStaffId || undefined,
    undefined,
    format(weekStart, 'yyyy-MM-dd'),
    format(weekEnd, 'yyyy-MM-dd')
  );

  const availability = availabilityData?.data || [];

  // Mutations
  const createMutation = useCreateStaffAvailability();
  const updateMutation = useUpdateStaffAvailability();
  const deleteMutation = useDeleteStaffAvailability();
  const bulkCreateMutation = useBulkCreateAvailability();

  const handleCreateAvailability = async () => {
    if (!selectedStaffId) {
      toast({
        title: "Error",
        description: "Please select a staff member first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        staff_id: selectedStaffId,
        date: newAvailability.date,
        start_time: newAvailability.start_time,
        end_time: newAvailability.end_time,
        is_available: newAvailability.is_available,
        reason: newAvailability.reason || undefined
      });

      setNewAvailability({
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        reason: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating availability:', error);
    }
  };

  const handleUpdateAvailability = async () => {
    if (!editingAvailability) return;

    try {
      await updateMutation.mutateAsync({
        id: editingAvailability.id,
        availability: {
          start_time: editingAvailability.start_time,
          end_time: editingAvailability.end_time,
          is_available: editingAvailability.is_available,
          reason: editingAvailability.reason || undefined
        }
      });

      setEditingAvailability(null);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this availability record?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting availability:', error);
      }
    }
  };

  const handleBulkSetWeekAvailability = async (isAvailable: boolean) => {
    if (!selectedStaffId) {
      toast({
        title: "Error",
        description: "Please select a staff member first.",
        variant: "destructive",
      });
      return;
    }

    const weekRecords = weekDays.map(day => ({
      staff_id: selectedStaffId,
      date: format(day, 'yyyy-MM-dd'),
      start_time: isAvailable ? '09:00' : undefined,
      end_time: isAvailable ? '17:00' : undefined,
      is_available: isAvailable,
      reason: isAvailable ? undefined : 'Bulk set unavailable'
    }));

    try {
      await bulkCreateMutation.mutateAsync(weekRecords);
    } catch (error) {
      console.error('Error setting bulk availability:', error);
    }
  };

  const getAvailabilityForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.filter(a => a.date === dateStr);
  };

  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Staff Availability</h2>
          <p className="text-muted-foreground">Manage staff working hours and availability</p>
        </div>

        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: 'calendar' | 'week' | 'list') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Availability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Availability Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {showStaffSelector && (
                  <div>
                    <Label htmlFor="staff">Staff Member</Label>
                    <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
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
                )}

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAvailability.date}
                    onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={newAvailability.is_available}
                    onCheckedChange={(checked) => setNewAvailability({ ...newAvailability, is_available: checked })}
                  />
                  <Label htmlFor="available">Available</Label>
                </div>

                {newAvailability.is_available && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newAvailability.start_time}
                        onChange={(e) => setNewAvailability({ ...newAvailability, start_time: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newAvailability.end_time}
                        onChange={(e) => setNewAvailability({ ...newAvailability, end_time: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {!newAvailability.is_available && (
                  <div>
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Textarea
                      id="reason"
                      value={newAvailability.reason}
                      onChange={(e) => setNewAvailability({ ...newAvailability, reason: e.target.value })}
                      placeholder="Reason for unavailability..."
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateAvailability}
                    disabled={createMutation.isPending}
                    className="flex-1"
                  >
                    {createMutation.isPending ? "Adding..." : "Add Availability"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Staff Selector */}
      {showStaffSelector && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="staffSelect">Select Staff Member</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a staff member to manage availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.name}</span>
                          <Badge variant="secondary">{member.status}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedStaffId && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkSetWeekAvailability(true)}
                    disabled={bulkCreateMutation.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Set Week Available
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkSetWeekAvailability(false)}
                    disabled={bulkCreateMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Set Week Unavailable
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week Navigation */}
      {viewMode === 'week' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              >
                Previous Week
              </Button>
              <div className="text-center">
                <h3 className="font-semibold">
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                </h3>
              </div>
              <Button
                variant="outline"
                onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              >
                Next Week
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!selectedStaffId ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Select a Staff Member</h3>
            <p className="text-muted-foreground">
              Choose a staff member from the dropdown above to manage their availability.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAvailability = getAvailabilityForDate(day);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <Card key={format(day, 'yyyy-MM-dd')} className={isToday ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">
                    {format(day, 'EEE dd')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {dayAvailability.length === 0 ? (
                    <div className="text-center py-4">
                      <Badge variant="secondary">Default Hours</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedStaff?.working_hours_start || '09:00'} - {selectedStaff?.working_hours_end || '17:00'}
                      </p>
                    </div>
                  ) : (
                    dayAvailability.map((avail) => (
                      <div
                        key={avail.id}
                        className={`p-2 rounded border ${
                          avail.is_available ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {avail.is_available ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <X className="w-3 h-3 text-red-600" />
                            )}
                            <span className="text-xs font-medium">
                              {avail.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => setEditingAvailability(avail)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleDeleteAvailability(avail.id)}
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {avail.is_available && avail.start_time && avail.end_time && (
                          <p className="text-xs text-muted-foreground">
                            {avail.start_time} - {avail.end_time}
                          </p>
                        )}
                        {avail.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {avail.reason}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Calendar and List views coming soon...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingAvailability && (
        <Dialog open={!!editingAvailability} onOpenChange={() => setEditingAvailability(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Availability</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="editAvailable"
                  checked={editingAvailability.is_available}
                  onCheckedChange={(checked) => 
                    setEditingAvailability({ ...editingAvailability, is_available: checked })
                  }
                />
                <Label htmlFor="editAvailable">Available</Label>
              </div>

              {editingAvailability.is_available && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={editingAvailability.start_time || ''}
                      onChange={(e) => 
                        setEditingAvailability({ ...editingAvailability, start_time: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={editingAvailability.end_time || ''}
                      onChange={(e) => 
                        setEditingAvailability({ ...editingAvailability, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {!editingAvailability.is_available && (
                <div>
                  <Label>Reason</Label>
                  <Textarea
                    value={editingAvailability.reason || ''}
                    onChange={(e) => 
                      setEditingAvailability({ ...editingAvailability, reason: e.target.value })
                    }
                    placeholder="Reason for unavailability..."
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpdateAvailability}
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
                <Button variant="outline" onClick={() => setEditingAvailability(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
