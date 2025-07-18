
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Plus, Minus, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TimeSelector } from '@/components/forms/TimeSelector';

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
  const [startTime, setStartTime] = useState(currentStartTime);
  const [endTime, setEndTime] = useState(currentEndTime);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const adjustTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    
    // Clamp between 6:00 and 22:00 (6 AM to 10 PM)
    const clampedMinutes = Math.max(360, Math.min(1320, totalMinutes));
    
    const newHours = Math.floor(clampedMinutes / 60);
    const newMins = clampedMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const extendStart = () => setStartTime(prev => adjustTime(prev, -60)); // Start 1 hour earlier
  const shortenStart = () => setStartTime(prev => adjustTime(prev, 60)); // Start 1 hour later
  const extendEnd = () => setEndTime(prev => adjustTime(prev, 60)); // End 1 hour later
  const shortenEnd = () => setEndTime(prev => adjustTime(prev, -60)); // End 1 hour earlier

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('staff')
        .update({
          working_hours_start: startTime,
          working_hours_end: endTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', staffId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Working hours updated for ${staffName}`,
      });

      onClose();
    } catch (error) {
      console.error('Error updating working hours:', error);
      toast({
        title: "Error",
        description: "Failed to update working hours",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentHours = () => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            Working Hours - {staffName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Schedule Display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-700">
                    {startTime} - {endTime}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {getCurrentHours()} hours per day
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Start Time Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Start Time</span>
                  <span className="text-lg font-mono">{startTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={extendStart}
                    disabled={startTime <= '06:00'}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Extend (1h earlier)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shortenStart}
                    disabled={startTime >= endTime}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Shorten (1h later)
                  </Button>
                </div>
              </div>

              {/* End Time Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">End Time</span>
                  <span className="text-lg font-mono">{endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shortenEnd}
                    disabled={endTime <= startTime}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Shorten (1h earlier)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={extendEnd}
                    disabled={endTime >= '22:00'}
                    className="flex-1"
                  >
                    <ArrowRight className="w-4 h-4 mr-1" />
                    Extend (1h later)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <TimeSelector
                    value={startTime}
                    onValueChange={setStartTime}
                    startHour={6}
                    endHour={22}
                    placeholder="Select start time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <TimeSelector
                    value={endTime}
                    onValueChange={setEndTime}
                    startHour={6}
                    endHour={22}
                    placeholder="Select end time"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || startTime >= endTime}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
