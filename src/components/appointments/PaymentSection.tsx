
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, DollarSign, FileText } from 'lucide-react';

interface PaymentSectionProps {
  paymentAmount: number;
  onPaymentAmountChange: (amount: number) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  paymentStatus: string;
  onPaymentStatusChange: (status: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  finalTotal: number;
  paymentMethods: any[];
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentAmount,
  onPaymentAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentStatus,
  onPaymentStatusChange,
  notes,
  onNotesChange,
  finalTotal,
  paymentMethods
}) => {
  return (
    <div className="space-y-4">
      {/* Payment Details */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span className="text-lg font-semibold text-amber-900">Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Payment Amount
              </Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => onPaymentAmountChange(Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-white"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name.toLowerCase()}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={onPaymentStatusChange}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {paymentAmount > 0 && paymentAmount !== finalTotal && (
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                Payment amount (${paymentAmount.toFixed(2)}) differs from service total (${finalTotal.toFixed(2)})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-700">Additional Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any additional notes about the appointment..."
            rows={3}
            className="w-full bg-white"
          />
        </CardContent>
      </Card>
    </div>
  );
};
