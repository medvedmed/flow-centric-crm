
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { availabilityApi } from '@/services/api/availabilityApi';

interface StaffAvailabilityProps {
  staffId: string;
  staffName: string;
}

const StaffAvailability: React.FC<StaffAvailabilityProps> = ({ staffId, staffName }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [isRequestingTimeOff, setIsRequestingTimeOff] = useState(false);

  const [newAvailability, setNewAvailability] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    reason: ''
  });

  const [newTimeOff, setNewTimeOff] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Fetch staff availability
  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ['staff-availability', staffId],
    queryFn: () => availabilityApi.getStaffAvailability(staffId),
    enabled: !!staffId,
  });

  // Fetch time off requests
  const { data: timeOffRequests = [], isLoading: timeOffLoading } = useQuery({
    queryKey: ['time-off-requests', staffId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('staff_id', staffId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!staffId,
  });

  // Create availability mutation
  const createAvailabilityMutation = useMutation({
    mutationFn: (availability: any) => availabilityApi.createStaffAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability', staffId] });
      toast({
        title: "Success",
        description: "Staff availability updated successfully.",
      });
      setNewAvailability({
        date: '',
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

  // Create time off request mutation
  const createTimeOffMutation = useMutation({
    mutationFn: async (request: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('time_off_requests')
        .insert({
          staff_id: staffId,
          salon_id: user.id,
          start_date: request.startDate,
          end_date: request.endDate,
          reason: request.reason,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests', staffId] });
      toast({
        title: "Success",
        description: "Time off request submitted successfully.",
      });
      setNewTimeOff({
        startDate: '',
        endDate: '',
        reason: ''
      });
      setIsRequestingTimeOff(false);
    },
    onError: (error) => {
      console.error('Error creating time off request:', error);
      toast({
        title: "Error",
        description: "Failed to submit time off request.",
        variant: "destructive",
      });
    }
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: string) => availabilityApi.deleteStaffAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability', staffId] });
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

    createAvailabilityMutation.mutate({
      staffId,
      date: newAvailability.date,
      startTime: newAvailability.startTime,
      endTime: newAvailability.endTime,
      isAvailable: newAvailability.isAvailable,
      reason: newAvailability.reason,
      salonId: '', // Will be set by the API
      id: '',
      createdAt: '',
      updatedAt: ''
    });
  };

  const handleRequestTimeOff = () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate || !newTimeOff.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    createTimeOffMutation.mutate(newTimeOff);
  };

  const removeAvailability = (id: string) => {
    deleteAvailabilityMutation.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (availabilityLoading || timeOffLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
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
                    <Label>Available</Label>
                    <Select onValueChange={(value) => setNewAvailability({...newAvailability, isAvailable: value === 'true'})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
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
                    {createAvailabilityMutation.isPending ? 'Adding...' : 'Add Availability'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availability.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No availability records found. Add some to get started.</p>
            ) : (
              availability.map(avail => (
                <div key={avail.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{avail.date}</span>
                    <Badge variant={avail.isAvailable ? "default" : "secondary"}>
                      {avail.startTime} - {avail.endTime}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {avail.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                    {avail.reason && (
                      <span className="text-xs text-muted-foreground">({avail.reason})</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAvailability(avail.id)}
                    disabled={deleteAvailabilityMutation.isPending}
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
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
                  <Button 
                    onClick={handleRequestTimeOff} 
                    className="w-full"
                    disabled={createTimeOffMutation.isPending}
                  >
                    {createTimeOffMutation.isPending ? 'Submitting...' : 'Submit Request'}
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
                      {request.start_date} to {request.end_date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {new Date(request.requested_at || request.created_at).toLocaleDateString()}
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
