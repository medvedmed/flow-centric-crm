import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import { Appointment } from '@/services/types';

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

type FormValues = {
  clientName: string;
  phoneNumber: string;
  serviceId: string;
  duration: number;
  startTime: Date | null;
};

export function EditAppointmentForm({ appointment, onClose }: Props) {
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
    reset({
      clientName: appointment.clientName,
      phoneNumber: appointment.clientPhone,       // or appointment.client.phone
      serviceId: appointment.serviceId,           // match your type exactly
      duration:   appointment.duration,
      startTime:  appointment.startTime
                    ? new Date(appointment.startTime)
                    : null,
    });
  }, [appointment, reset]);

  const onSubmit = (data: FormValues) => {
    // call your update API…
    console.log('Saving', data);
    onClose();
  };

  return (
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
            <Select {...field} value={field.value || ''}>
              {/* your `services` list needs to be passed in or fetched */}
              {/** <SelectItem value="svc1">Service 1</SelectItem> **/}
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
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              showTimeSelect
              dateFormat="Pp"
              className="w-full"
            />
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
  );
}
