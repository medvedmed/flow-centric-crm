
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash, Calendar, Save, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { availabilityApi } from '@/services/api/availabilityApi';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StaffAvailabilityManagerProps {
  staffId: string;
  staffName: string;
}

const StaffAvailabilityManager: React.FC<StaffAvailabilityManagerProps> = ({ staffId, staffName }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [newAvailability, setNewAvailability] = useState({
    date: selectedDate,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    reason: ''
  });

  // Fetch staff availability
  const { data: availability = [], isLoading, error, refetch } = useQuery({
    queryKey: ['staff-availability-manager', staffId, selectedDate],
    queryFn: () => availabilityApi.getStaffAvailability(staffId, selectedDate),
    enabled: !!staffId,
  });

  // Create availability mutation
  const createAvailabilityMutation = useMutation({
    mutationFn: (availability: any) => availabilityApi.createStaffAvailability({
      id: '',
      staffId: staffId,
      salonId: '',
      date: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      isAvailable: availability.isAvailable,
      reason: availability.reason,
      createdAt: '',
      updatedAt: ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability-manager'] });
      queryClient.invalidateQueries({ queryKey: ['staff-availability-calendar'] });
      toast({
        title: "Success",
        description: "Staff availability updated successfully.",
      });
      setNewAvailability({
        date: selectedDate,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
        reason: ''
      });
      setIsAddingAvailability(false);
    },
    onError: (error) => {
      console.error('Error creating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update staff availability.",
        variant: "destructive",
      });
    }
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => availabilityApi.deleteStaffAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability-manager'] });
      queryClient.invalidateQueries({ queryKey: ['staff-availability-calendar'] });
      toast({
        title: "Success",
        description: "Availability record deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting availability:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability record.",
        variant: "destructive",
      });
    }
  });

  const handleAddAvailability = () => {
    if (!newAvailability.date) {
      toast({
        title: "Validation Error",
        description: "Please select a date.",
        variant: "destructive",
      });
      return;
    }

    if (newAvailability.startTime >= newAvailability.endTime) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    createAvailabilityMutation.mutate(newAvailability);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Availability data has been refreshed.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span className="ml-2">Loading availability data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Staff Availability */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Staff Availability - {staffName}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isAddingAvailability} onOpenChange={setIsAddingAvailability}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Availability
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Staff Availability</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newAvailability.date}
                        onChange={(e) => setNewAvailability({...newAvailability, date: e.target.value})}
                      />
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
                    <div>
                      <Label>Status</Label>
                      <Select onValueChange={(value) => setNewAvailability({...newAvailability, isAvailable: value === 'true'})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Available</SelectItem>
                          <SelectItem value="false">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Reason (optional)</Label>
                      <Input
                        value={newAvailability.reason}
                        onChange={(e) => setNewAvailability({...newAvailability, reason: e.target.value})}
                        placeholder="Meeting, break, training..."
                      />
                    </div>
                    <Button 
                      onClick={handleAddAvailability} 
                      className="w-full"
                      disabled={createAvailabilityMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {createAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label>Filter by Date:</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 max-w-xs"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Error loading availability: {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {availability.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">No availability records found for {selectedDate}</p>
                <p className="text-sm text-gray-500 mt-2">Add availability records to manage staff schedules</p>
              </div>
            ) : (
              availability.map(avail => (
                <div key={avail.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{avail.date}</span>
                      <span className="text-sm text-gray-600">
                        {avail.startTime} - {avail.endTime}
                      </span>
                    </div>
                    <Badge variant={avail.isAvailable ? "default" : "secondary"}>
                      {avail.isAvailable ? 'Available' : 'Not Available'}
                    </Badge>
                    {avail.reason && (
                      <span className="text-sm text-muted-foreground">
                        Reason: {avail.reason}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteAvailabilityMutation.mutate(avail.id)}
                    disabled={deleteAvailabilityMutation.isPending}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setNewAvailability({
                  date: selectedDate,
                  startTime: '09:00',
                  endTime: '17:00',
                  isAvailable: true,
                  reason: ''
                });
                setIsAddingAvailability(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Full Day
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNewAvailability({
                  date: selectedDate,
                  startTime: '12:00',
                  endTime: '13:00',
                  isAvailable: false,
                  reason: 'Lunch Break'
                });
                setIsAddingAvailability(true);
              }}
            >
              <Clock className="w-4 h-4 mr-2" />
              Add Break
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNewAvailability({
                  date: selectedDate,
                  startTime: '09:00',
                  endTime: '17:00',
                  isAvailable: false,
                  reason: 'Day Off'
                });
                setIsAddingAvailability(true);
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Mark Day Off
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAvailabilityManager;
