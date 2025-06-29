import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Appointment } from '@/services/types';

interface ExtraService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  appointment,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAppointment, setEditedAppointment] = useState<Partial<Appointment>>({});
  const [extraServices, setExtraServices] = useState<ExtraService[]>([]);
  const [tipAmount, setTipAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (appointment) {
      setEditedAppointment(appointment);
    }
  }, [appointment]);

  const updateAppointment = useMutation({
    mutationFn: async (updates: Partial<Appointment>) => {
      if (!editedAppointment?.id) throw new Error('Missing appointment ID');
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', editedAppointment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: 'Updated', description: 'Appointment updated successfully.' });
      setIsEditing(false);
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update appointment.',
        variant: 'destructive'
      });
    }
  });

  const totalExtra = extraServices.reduce((sum, s) => sum + s.price, 0);
  const total = (Number(appointment?.price || 0) + totalExtra + tipAmount).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>
              <Calendar className="inline-block mr-2 w-5 h-5" />
              Appointment Details
            </DialogTitle>
            <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Client Name</Label>
            {isEditing ? (
              <Input
                value={editedAppointment.clientName || ''}
                onChange={(e) => setEditedAppointment({ ...editedAppointment, clientName: e.target.value })}
              />
            ) : (
              <p>{appointment?.clientName}</p>
            )}
          </div>

          <div>
            <Label>Phone</Label>
            {isEditing ? (
              <Input
                value={editedAppointment.clientPhone || ''}
                onChange={(e) => setEditedAppointment({ ...editedAppointment, clientPhone: e.target.value })}
              />
            ) : (
              <p>{appointment?.clientPhone}</p>
            )}
          </div>

          <div>
            <Label>Service</Label>
            {isEditing ? (
              <Input
                value={editedAppointment.service || ''}
                onChange={(e) => setEditedAppointment({ ...editedAppointment, service: e.target.value })}
              />
            ) : (
              <p>{appointment?.service}</p>
            )}
          </div>

          <div>
            <Label>Status</Label>
            {isEditing ? (
              <Select
                value={editedAppointment.status || ''}
                onValueChange={(val) => setEditedAppointment({ ...editedAppointment, status: val as any })}
              >
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
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
              <Badge>{appointment?.status}</Badge>
            )}
          </div>

          <div>
            <Label>Notes</Label>
            {isEditing ? (
              <Textarea
                value={editedAppointment.notes || ''}
                onChange={(e) => setEditedAppointment({ ...editedAppointment, notes: e.target.value })}
              />
            ) : (
              <p>{appointment?.notes || 'No notes'}</p>
            )}
          </div>

          {isEditing && (
            <Button onClick={() => updateAppointment.mutate(editedAppointment)}>
              Save Changes
            </Button>
          )}

          <Separator />

          <div>
            <Label>Tip</Label>
            <Input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(Number(e.target.value))}
              placeholder="$0.00"
            />
          </div>

          <div>
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Choose method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Total Amount</Label>
            <p className="text-lg font-bold text-green-700">${total}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
