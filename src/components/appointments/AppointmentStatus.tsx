
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AppointmentStatusProps {
  status: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentMethod: string;
  appointmentColor: string;
  onPaymentStatusChange: (status: 'paid' | 'unpaid' | 'partial') => void;
  onPaymentMethodChange: (method: string) => void;
  onColorChange: (color: string) => void;
}

export const AppointmentStatus: React.FC<AppointmentStatusProps> = ({
  status,
  paymentStatus,
  paymentMethod,
  appointmentColor,
  onPaymentStatusChange,
  onPaymentMethodChange,
  onColorChange
}) => {
  return (
    <>
      {/* Status and Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={status}>
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
        </div>
        <div>
          <Label htmlFor="payment_status">Payment Status</Label>
          <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <Label htmlFor="color">Appointment Color</Label>
        <Input
          type="color"
          id="color"
          name="color"
          value={appointmentColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-20 h-10"
        />
      </div>
    </>
  );
};
