import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const createAppointment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('appointments').insert({
        client_name: form.clientName,
        client_phone: form.clientPhone,
        service: form.service,
        date: form.date,
        start_time: form.startTime,
        end_time: form.endTime,
        notes: form.notes,
        salon_id: user?.id,
        status: 'Scheduled',
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Appointment added.' });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
      setForm({
        clientName: '',
        clientPhone: '',
        service: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add appointment.', variant: 'destructive' });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppointment.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Client Name</Label>
            <Input name="clientName" value={form.clientName} onChange={handleChange} />
          </div>
          <div>
            <Label>Client Phone</Label>
            <Input name="clientPhone" value={form.clientPhone} onChange={handleChange} />
          </div>
          <div>
            <Label>Service</Label>
            <Input name="service" value={form.service} onChange={handleChange} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" name="date" value={form.date} onChange={handleChange} />
          </div>
          <div>
            <Label>Start Time</Label>
            <Input type="time" name="startTime" value={form.startTime} onChange={handleChange} />
          </div>
          <div>
            <Label>End Time</Label>
            <Input type="time" name="endTime" value={form.endTime} onChange={handleChange} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea name="notes" value={form.notes} onChange={handleChange} />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createAppointment.isPending}>
              {createAppointment.isPending ? 'Adding...' : 'Add Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
