
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { staffAvailabilityApi } from '@/services/api/staffAvailabilityApi';
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

interface StaffAvailabilityManagerProps {
  staffId: string;
  staffName: string;
}

const StaffAvailabilityManager: React.FC<StaffAvailabilityManagerProps> = ({
  staffId,
  staffName
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  // Get availability for the selected date
  const { data: availability, isLoading } = useQuery({
    queryKey: ['staff-availability', staffId, selectedDate],
    queryFn: () => staffAvailabilityApi.getStaffAvailability(staffId, selectedDate),
    enabled: !!staffId
  });

  // Get week view of availability
  const weekStart = startOfWeek(new Date(selectedDate));
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    format(addDays(weekStart, i), 'yyyy-MM-dd')
  );

  const { data: weekAvailability } = useQuery({
    queryKey: ['staff-availability-week', staffId, weekStart],
    queryFn: () => staffAvailabilityApi.getAvailabilityRange(
      staffId, 
      weekDates[0], 
      weekDates[6]
    ),
    enabled: !!staffId
  });

  const [newAvailability, setNewAvailability] = useState({
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
    reason: ''
  });

  const handleCreateAvailability = async () => {
    if (!staffId) return;
    
    setLoading(true);
    try {
      await staffAvailabilityApi.createStaffAvailability({
        staffId,
        date: selectedDate,
        startTime: newAvailability.startTime,
        endTime: newAvailability.endTime,
        isAvailable: newAvailability.isAvailable,
        reason: newAvailability.reason
      });

      // Invalidate related queries to refresh schedule
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['staff-availability'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
      ]);

      setNewAvailability({
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
        reason: ''
      });

      toast({
        title: "Success!",
        description: "Staff availability updated successfully",
      });
    } catch (error) {
      console.error('Error creating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    try {
      await staffAvailabilityApi.deleteStaffAvailability(availabilityId);
      
      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['staff-availability'] }),
        queryClient.invalidateQueries({ queryKey: ['appointments'] }),
        queryClient.invalidateQueries({ queryKey: ['staff-schedule'] })
      ]);

      toast({
        title: "Success!",
        description: "Availability record deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete availability",
        variant: "destructive",
      });
    }
  };

  const getWeekAvailabilityForDate = (date: string) => {
    return weekAvailability?.filter(a => a.date === date) || [];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            Availability for {staffName}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Week Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Week Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const dayAvailability = getWeekAvailabilityForDate(date);
              const isSelected = date === selectedDate;
              const dayName = format(new Date(date), 'EEE');
              const dayNumber = format(new Date(date), 'd');
              
              return (
                <div
                  key={date}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-violet-500 bg-violet-50' 
                      : 'border-gray-200 hover:border-violet-300'
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">{dayName}</div>
                    <div className="text-lg">{dayNumber}</div>
                    <div className="flex flex-col gap-1 mt-2">
                      {dayAvailability.length === 0 ? (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      ) : (
                        dayAvailability.map((avail, idx) => (
                          <Badge
                            key={idx}
                            variant={avail.isAvailable ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {avail.isAvailable 
                              ? `${avail.startTime}-${avail.endTime}` 
                              : 'Unavailable'
                            }
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Current Availability - {format(new Date(selectedDate), 'MMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availability?.data && availability.data.length > 0 ? (
              <div className="space-y-3">
                {availability.data.map((avail) => (
                  <div
                    key={avail.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {avail.isAvailable ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          {avail.isAvailable ? 'Available' : 'Unavailable'}
                        </div>
                        {avail.startTime && avail.endTime && (
                          <div className="text-sm text-gray-600">
                            {avail.startTime} - {avail.endTime}
                          </div>
                        )}
                        {avail.reason && (
                          <div className="text-sm text-gray-500">{avail.reason}</div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteAvailability(avail.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No specific availability set for this date</p>
                <p className="text-sm">Staff will follow default working hours</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Set Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Available</Label>
              <Switch
                checked={newAvailability.isAvailable}
                onCheckedChange={(checked) =>
                  setNewAvailability(prev => ({ ...prev, isAvailable: checked }))
                }
              />
            </div>

            {newAvailability.isAvailable && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newAvailability.startTime}
                    onChange={(e) =>
                      setNewAvailability(prev => ({ ...prev, startTime: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newAvailability.endTime}
                    onChange={(e) =>
                      setNewAvailability(prev => ({ ...prev, endTime: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Reason (optional)</Label>
              <Textarea
                value={newAvailability.reason}
                onChange={(e) =>
                  setNewAvailability(prev => ({ ...prev, reason: e.target.value }))
                }
                placeholder={newAvailability.isAvailable 
                  ? "Special hours, event, etc." 
                  : "Vacation, sick leave, personal time, etc."
                }
                rows={2}
              />
            </div>

            <Button
              onClick={handleCreateAvailability}
              disabled={loading}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Availability'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffAvailabilityManager;
