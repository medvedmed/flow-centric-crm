
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WorkingHours {
  staffId: string;
  staffName: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  breakStart: string;
  breakEnd: string;
  workingDays: string[];
}

interface WorkingHoursManagerProps {
  trigger?: React.ReactNode;
}

export const WorkingHoursManager: React.FC<WorkingHoursManagerProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (isOpen) {
      fetchWorkingHours();
    }
  }, [isOpen]);

  const fetchWorkingHours = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      const workingHoursData = staff.map(member => ({
        staffId: member.id,
        staffName: member.name,
        workingHoursStart: member.working_hours_start || '09:00',
        workingHoursEnd: member.working_hours_end || '17:00',
        breakStart: member.break_start || '12:00',
        breakEnd: member.break_end || '13:00',
        workingDays: member.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }));

      setWorkingHours(workingHoursData);
    } catch (error) {
      console.error('Error fetching working hours:', error);
      toast({
        title: "Error",
        description: "Failed to load working hours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHours = (staffId: string, field: keyof WorkingHours, value: any) => {
    setWorkingHours(prev => 
      prev.map(wh => 
        wh.staffId === staffId ? { ...wh, [field]: value } : wh
      )
    );
  };

  const toggleWorkingDay = (staffId: string, day: string) => {
    setWorkingHours(prev => 
      prev.map(wh => {
        if (wh.staffId === staffId) {
          const newDays = wh.workingDays.includes(day)
            ? wh.workingDays.filter(d => d !== day)
            : [...wh.workingDays, day];
          return { ...wh, workingDays: newDays };
        }
        return wh;
      })
    );
  };

  const saveWorkingHours = async () => {
    try {
      setSaving(true);
      
      for (const wh of workingHours) {
        const { error } = await supabase
          .from('staff')
          .update({
            working_hours_start: wh.workingHoursStart,
            working_hours_end: wh.workingHoursEnd,
            break_start: wh.breakStart,
            break_end: wh.breakEnd,
            working_days: wh.workingDays,
            updated_at: new Date().toISOString()
          })
          .eq('id', wh.staffId);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Working hours updated successfully",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving working hours:', error);
      toast({
        title: "Error",
        description: "Failed to save working hours",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = (staffId: string) => {
    updateWorkingHours(staffId, 'workingHoursStart', '09:00');
    updateWorkingHours(staffId, 'workingHoursEnd', '17:00');
    updateWorkingHours(staffId, 'breakStart', '12:00');
    updateWorkingHours(staffId, 'breakEnd', '13:00');
    updateWorkingHours(staffId, 'workingDays', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  };

  if (!isOpen) {
    return (
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            Manage Working Hours
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Working Hours Management
            </CardTitle>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {workingHours.map((wh, index) => (
                <Card key={wh.staffId} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-violet-600" />
                        <CardTitle className="text-lg">{wh.staffName}</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetToDefault(wh.staffId)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Working Hours */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`start-${wh.staffId}`}>Start Time</Label>
                        <Input
                          id={`start-${wh.staffId}`}
                          type="time"
                          value={wh.workingHoursStart}
                          onChange={(e) => updateWorkingHours(wh.staffId, 'workingHoursStart', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`end-${wh.staffId}`}>End Time</Label>
                        <Input
                          id={`end-${wh.staffId}`}
                          type="time"
                          value={wh.workingHoursEnd}
                          onChange={(e) => updateWorkingHours(wh.staffId, 'workingHoursEnd', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Break Hours */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`break-start-${wh.staffId}`}>Break Start</Label>
                        <Input
                          id={`break-start-${wh.staffId}`}
                          type="time"
                          value={wh.breakStart}
                          onChange={(e) => updateWorkingHours(wh.staffId, 'breakStart', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`break-end-${wh.staffId}`}>Break End</Label>
                        <Input
                          id={`break-end-${wh.staffId}`}
                          type="time"
                          value={wh.breakEnd}
                          onChange={(e) => updateWorkingHours(wh.staffId, 'breakEnd', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Working Days */}
                    <div>
                      <Label>Working Days</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {daysOfWeek.map(day => (
                          <Badge
                            key={day}
                            variant={wh.workingDays.includes(day) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleWorkingDay(wh.staffId, day)}
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Schedule:</strong> {wh.workingHoursStart} - {wh.workingHoursEnd} 
                        {wh.breakStart && wh.breakEnd && (
                          <span> (Break: {wh.breakStart} - {wh.breakEnd})</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Days:</strong> {wh.workingDays.length > 0 ? wh.workingDays.join(', ') : 'No days selected'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveWorkingHours} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Working Hours'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
