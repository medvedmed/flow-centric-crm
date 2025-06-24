
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DollarSign, Printer, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import { EnhancedReceiptGenerator } from './EnhancedReceiptGenerator';

interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_date: string;
  client_name: string;
  services: string;
  created_at: string;
}

interface PaymentTrackerProps {
  appointmentId?: string;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({ appointmentId }) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [completedPaymentId, setCompletedPaymentId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch pending payments/appointments
  const { data: pendingPayments = [], isLoading } = useQuery({
    queryKey: ['pending-payments', appointmentId],
    queryFn: async () => {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      let query = supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', profile.user.id)
        .eq('status', 'Completed')
        .is('payment_status', null);

      if (appointmentId) {
        query = query.eq('id', appointmentId);
      }

      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Fetch recent payments
  const { data: recentPayments = [] } = useQuery({
    queryKey: ['recent-payments'],
    queryFn: async () => {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', profile.user.id)
        .eq('transaction_type', 'income')
        .eq('reference_type', 'appointment')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Real-time subscription for payment updates
  useEffect(() => {
    const channel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_transactions'
        },
        (payload) => {
          console.log('Payment update:', payload);
          queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
          queryClient.invalidateQueries({ queryKey: ['recent-payments'] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Payment Received",
              description: `Payment of $${payload.new.amount} received successfully!`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const processPaymentMutation = useMutation({
    mutationFn: async ({ appointmentId, amount, method }: { appointmentId: string; amount: number; method: string }) => {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      // Get appointment details
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) throw appointmentError;

      // Create financial transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('financial_transactions')
        .insert([{
          salon_id: profile.user.id,
          transaction_type: 'income',
          category: 'Service Payment',
          amount: amount,
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

      return { transaction, appointment };
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Processed",
        description: `Payment of $${data.transaction.amount} processed successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['recent-payments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      setShowPaymentDialog(false);
      setCompletedPaymentId(data.appointment.id);
      setShowReceiptDialog(true);
      setPaymentAmount('');
      setPaymentMethod('cash');
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const handlePaymentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setPaymentAmount(appointment.price.toString());
    setShowPaymentDialog(true);
  };

  const handleProcessPayment = () => {
    if (!selectedAppointment || !paymentAmount) return;

    processPaymentMutation.mutate({
      appointmentId: selectedAppointment.id,
      amount: parseFloat(paymentAmount),
      method: paymentMethod
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pending Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading pending payments...</div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>All payments are up to date!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{appointment.client_name}</span>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.service} • {appointment.date} • {appointment.start_time}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{formatCurrency(appointment.price)}</span>
                    <Button
                      onClick={() => handlePaymentClick(appointment)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Process Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No recent payments
            </div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getPaymentMethodIcon(payment.payment_method)}
                    <div>
                      <div className="font-medium">{formatCurrency(payment.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {payment.payment_method}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Processing Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">{selectedAppointment.client_name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedAppointment.service}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedAppointment.date} at {selectedAppointment.start_time}
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleProcessPayment}
                  disabled={processPaymentMutation.isPending || !paymentAmount}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processPaymentMutation.isPending ? 'Processing...' : 'Process Payment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Payment Processed - Generate Receipt
            </DialogTitle>
          </DialogHeader>
          {completedPaymentId && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Payment processed successfully!</span>
                </div>
              </div>
              
              <EnhancedReceiptGenerator appointmentId={completedPaymentId} />
              
              <div className="flex justify-end">
                <Button onClick={() => setShowReceiptDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
