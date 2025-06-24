
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DollarSign, CreditCard, Banknote, Receipt } from 'lucide-react';
import { format } from 'date-fns';

interface TodayAppointment {
  id: string;
  client_name: string;
  service: string;
  start_time: string;
  price: number;
  payment_status: string;
  staff_id: string;
}

export const DashboardQuickPayment = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const queryClient = useQueryClient();

  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch today's unpaid appointments
  const { data: todayAppointments = [], isLoading } = useQuery({
    queryKey: ['today-appointments', today],
    queryFn: async (): Promise<TodayAppointment[]> => {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', profile.user.id)
        .eq('date', today)
        .eq('payment_status', 'unpaid')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ appointmentId, method }: { appointmentId: string; method: string }) => {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      const appointment = todayAppointments.find(apt => apt.id === appointmentId);
      if (!appointment) throw new Error('Appointment not found');

      // Create financial transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('financial_transactions')
        .insert([{
          salon_id: profile.user.id,
          transaction_type: 'income',
          category: 'Service Payment',
          amount: appointment.price,
          description: `Payment for ${appointment.service} - ${appointment.client_name}`,
          payment_method: method,
          reference_id: appointmentId,
          reference_type: 'appointment',
          transaction_date: new Date().toISOString().split('T')[0],
          created_by: profile.user.id
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update appointment payment status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          payment_status: 'paid',
          payment_method: method,
          payment_date: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      return transaction;
    },
    onSuccess: (data, variables) => {
      const appointment = todayAppointments.find(apt => apt.id === variables.appointmentId);
      toast({
        title: "Payment Recorded",
        description: `Payment of $${appointment?.price} recorded successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ['today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      setSelectedAppointment('');
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const handleProcessPayment = () => {
    if (!selectedAppointment) {
      toast({
        title: "Select Appointment",
        description: "Please select an appointment to process payment",
        variant: "destructive",
      });
      return;
    }

    processPaymentMutation.mutate({
      appointmentId: selectedAppointment,
      method: paymentMethod
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const selectedAppointmentData = todayAppointments.find(apt => apt.id === selectedAppointment);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Quick Payment - Today's Appointments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Appointment Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Unpaid Appointment</label>
          <Select value={selectedAppointment} onValueChange={setSelectedAppointment}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an appointment..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="p-2 text-center text-muted-foreground">Loading appointments...</div>
              ) : todayAppointments.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">No unpaid appointments today</div>
              ) : (
                todayAppointments.map((appointment) => (
                  <SelectItem key={appointment.id} value={appointment.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{appointment.start_time}</span> - {appointment.client_name}
                      </div>
                      <div className="ml-4">
                        <span className="text-sm text-muted-foreground">{appointment.service}</span>
                        <Badge variant="outline" className="ml-2">
                          {formatCurrency(appointment.price)}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Appointment Details */}
        {selectedAppointmentData && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-lg">{selectedAppointmentData.client_name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedAppointmentData.service} at {selectedAppointmentData.start_time}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedAppointmentData.price)}
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Unpaid
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  Cash
                </div>
              </SelectItem>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Credit/Debit Card
                </div>
              </SelectItem>
              <SelectItem value="mobile">Mobile Payment</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Process Payment Button */}
        <Button
          onClick={handleProcessPayment}
          disabled={processPaymentMutation.isPending || !selectedAppointment}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {processPaymentMutation.isPending ? (
            'Processing Payment...'
          ) : (
            <>
              <Receipt className="w-4 h-4 mr-2" />
              Record Payment {selectedAppointmentData && `- ${formatCurrency(selectedAppointmentData.price)}`}
            </>
          )}
        </Button>

        {/* Summary */}
        <div className="text-center text-sm text-muted-foreground">
          {todayAppointments.length} unpaid appointment{todayAppointments.length !== 1 ? 's' : ''} remaining today
        </div>
      </CardContent>
    </Card>
  );
};
