
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Edit3 } from 'lucide-react';
import { Appointment } from '@/services/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AppointmentDetailsPanelProps {
  appointment: Appointment;
}

export const AppointmentDetailsPanel: React.FC<AppointmentDetailsPanelProps> = ({
  appointment
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState<Partial<Appointment>>({});

  useEffect(() => {
    if (appointment) {
      setEditedAppointment(appointment);
    }
  }, [appointment]);

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async (updates: Partial<Appointment>) => {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointment?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Success', description: 'Appointment updated successfully!' });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update appointment', variant: 'destructive' });
    },
  });

  const handleSave = () => {
    updateAppointmentMutation.mutate(editedAppointment);
  };

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-violet-600" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Client Name</Label>
              {isEditing ? (
                <Input
                  value={editedAppointment.clientName || ''}
                  onChange={(e) => setEditedAppointment({...editedAppointment, clientName: e.target.value})}
                />
              ) : (
                <p className="font-medium">{appointment.clientName}</p>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              {isEditing ? (
                <Input
                  value={editedAppointment.clientPhone || ''}
                  onChange={(e) => setEditedAppointment({...editedAppointment, clientPhone: e.target.value})}
                />
              ) : (
                <p className="font-medium">{appointment.clientPhone || 'N/A'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              Appointment Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="border-violet-200"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Service</Label>
              {isEditing ? (
                <Input
                  value={editedAppointment.service || ''}
                  onChange={(e) => setEditedAppointment({...editedAppointment, service: e.target.value})}
                />
              ) : (
                <p className="font-medium">{appointment.service}</p>
              )}
            </div>
            <div>
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={editedAppointment.status}
                  onValueChange={(value) => setEditedAppointment({...editedAppointment, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="No Show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary">{appointment.status}</Badge>
              )}
            </div>
            <div>
              <Label>Date & Time</Label>
              <p className="font-medium">{appointment.date} {appointment.startTime} - {appointment.endTime}</p>
            </div>
            <div>
              <Label>Price</Label>
              <p className="font-medium text-green-600">${appointment.price}</p>
            </div>
          </div>
          
          <div>
            <Label>Notes</Label>
            {isEditing ? (
              <Textarea
                value={editedAppointment.notes || ''}
                onChange={(e) => setEditedAppointment({...editedAppointment, notes: e.target.value})}
                placeholder="Add notes..."
              />
            ) : (
              <p className="text-gray-600">{appointment.notes || 'No notes'}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={updateAppointmentMutation.isPending}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
