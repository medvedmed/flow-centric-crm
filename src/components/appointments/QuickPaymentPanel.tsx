
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign } from 'lucide-react';
import { Appointment } from '@/services/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface AppointmentService {
  id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
}

interface QuickPaymentPanelProps {
  appointment: Appointment;
  appointmentServices: AppointmentService[];
  paymentMethods: any[];
  onPaymentComplete: () => void;
}

export const QuickPaymentPanel: React.FC<QuickPaymentPanelProps> = ({
  appointment,
  appointmentServices,
  paymentMethods,
  onPaymentComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tipAmount, setTipAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

  const basePrice = Number(appointment.price) || 0;
  const servicesPrice = appointmentServices.reduce((sum, service) => sum + Number(service.service_price), 0);
  const totalAmount = basePrice + servicesPrice + tipAmount;

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');

      // Update appointment payment status
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          payment_status: 'paid',
          payment_method: paymentMethod,
          payment_date: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (appointmentError) throw appointmentError;

      // Create financial transaction
      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert({
          salon_id: user.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: totalAmount,
          description: `Payment for ${appointment.service} - ${appointment.clientName}${tipAmount > 0 ? ` (includes $${tipAmount} tip)` : ''}`,
          payment_method: paymentMethod,
          transaction_date: new Date().toISOString().split('T')[0]
        });

      if (transactionError) throw transactionError;
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Payment processed successfully!' });
      onPaymentComplete();
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to process payment', variant: 'destructive' });
    },
  });

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-violet-600" />
          Quick Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Base Service:</span>
            <span>${basePrice}</span>
          </div>
          
          {appointmentServices.length > 0 && (
            <div className="flex justify-between">
              <span>Additional Services:</span>
              <span>${servicesPrice}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tip Amount</Label>
            <Input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(Number(e.target.value))}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.name}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount:</span>
            <span className="text-green-600">${totalAmount.toFixed(2)}</span>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
            onClick={() => processPaymentMutation.mutate()}
            disabled={!paymentMethod || processPaymentMutation.isPending}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Process Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
