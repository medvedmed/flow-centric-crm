
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';

interface PaymentSectionProps {
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paymentMethod: string;
  onPaymentStatusChange: (status: 'paid' | 'unpaid' | 'partial') => void;
  onPaymentMethodChange: (method: string) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentStatus,
  paymentMethod,
  onPaymentStatusChange,
  onPaymentMethodChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        <h3 className="font-semibold">Payment</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paymentStatus">Payment Status</Label>
          <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="transfer">Bank Transfer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
