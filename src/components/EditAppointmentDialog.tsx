import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Appointment } from '@/services/types';

interface Props {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = {
  clientName: string;
  phoneNumber: string;
  serviceId: string;
  duration: number;
  startTime: Date | null;
};

export function EditAppointmentForm({ appointment, isOpen, onClose }: Props) {
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      clientName: '',
      phoneNumber: '',
      serviceId: '',
      duration: 0,
      startTime: null,
    },
  });

  // As soon as appointment changes, repopulate the form:
  useEffect(() => {
    if (appointment) {
      reset({
        clientName: appointment.clientName || '',
        phoneNumber: appointment.clientPhone || '',
        serviceId: appointment.service || '',
        duration: appointment.duration || 60,
        startTime: appointment.startTime ? new Date(appointment.startTime) : null,
      });
    }
  }, [appointment, reset]);

  const onSubmit = (data: FormValues) => {
    // call your update API…
    console.log('Saving', data);
    onClose();
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Client Name</label>
            <Input {...register('clientName')} />
          </div>

          <div>
            <label>Phone Number</label>
            <Input {...register('phoneNumber')} />
          </div>

          <div>
            <label>Main Service</label>
            <Controller
              name="serviceId"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hair Cut">Hair Cut</SelectItem>
                    <SelectItem value="Hair Coloring">Hair Coloring</SelectItem>
                    <SelectItem value="Facial">Facial</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label>Duration (min)</label>
            <Input type="number" {...register('duration', { valueAsNumber: true })} />
          </div>

          <div>
            <label>Start Time</label>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
