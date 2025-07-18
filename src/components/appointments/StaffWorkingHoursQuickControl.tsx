
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Plus, Minus, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StaffWorkingHoursQuickControlProps {
  staffId: string;
  staffName: string;
  currentStartTime: string;
  currentEndTime: string;
  onClose: () => void;
}

export const StaffWorkingHoursQuickControl: React.FC<StaffWorkingHoursQuickControlProps> = ({
  staffId,
  staffName,
  currentStartTime,
  currentEndTime,
  onClose
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateWorkingHoursMutation = useMutation({
    mutationFn: async ({ startTime, endTime }: { startTime: string; endTime: string }) => {
      const { error } = await supabase
        .from('staff')
        .update({
          working_hours_start: startTime,
          working_hours_end: endTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: 'Success', description: 'Working hours updated successfully!' });
    },
    onError: (error) => {
      console.error('Error updating working hours:', error);
      toast({ title: 'Error', description: 'Failed to update working hours', variant: 'destructive' });
    }
  });

  const adjustTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleExtendStart = () => {
    const newStartTime = adjustTime(currentStartTime, -60);
    updateWorkingHoursMutation.mutate({ startTime: newStartTime, endTime: currentEndTime });
  };

  const handleShortenStart = () => {
    const newStartTime = adjustTime(currentStartTime, 60);
    if (newStartTime < currentEndTime) {
      updateWorkingHoursMutation.mutate({ startTime: newStartTime, endTime: currentEndTime });
    } else {
      toast({ title: 'Error', description: 'Start time cannot be after end time', variant: 'destructive' });
    }
  };

  const handleExtendEnd = () => {
    const newEndTime = adjustTime(currentEndTime, 60);
    updateWorkingHoursMutation.mutate({ startTime: currentStartTime, endTime: newEndTime });
  };

  const handleShortenEnd = () => {
    const newEndTime = adjustTime(currentEndTime, -60);
    if (newEndTime > currentStartTime) {
      updateWorkingHoursMutation.mutate({ startTime: currentStartTime, endTime: newEndTime });
    } else {
      toast({ title: 'Error', description: 'End time cannot be before start time', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {staffName}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold">
                {currentStartTime} - {currentEndTime}
              </span>
            </div>
          </div>

          {/* Start Time Controls */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              Start Time: {currentStartTime}
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExtendStart}
                disabled={updateWorkingHoursMutation.isPending}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Extend (Start Earlier)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShortenStart}
                disabled={updateWorkingHoursMutation.isPending}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Shorten (Start Later)
              </Button>
            </div>
          </div>

          {/* End Time Controls */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              End Time: {currentEndTime}
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExtendEnd}
                disabled={updateWorkingHoursMutation.isPending}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Extend (End Later)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShortenEnd}
                disabled={updateWorkingHoursMutation.isPending}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Shorten (End Earlier)
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p><strong>Note:</strong> Changes will immediately affect appointment booking availability. Slots outside these hours will be blocked.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
