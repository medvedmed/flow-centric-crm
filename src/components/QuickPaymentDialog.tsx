
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, User, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_spent: number;
}

interface TodayAppointment {
  id: string;
  client_name: string;
  client_phone?: string;
  service: string;
  price: number;
  status: string;
  start_time: string;
  payment_status?: string;
}

interface QuickPaymentDialogProps {
  trigger?: React.ReactNode;
}

export const QuickPaymentDialog: React.FC<QuickPaymentDialogProps> = ({ trigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<TodayAppointment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [searchTerm, setSearchTerm] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['today-appointments-payment', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('date', today)
        .in('status', ['Completed', 'In Progress'])
        .order('start_time');
      
      if (error) throw error;
      return data as TodayAppointment[];
    },
    enabled: !!user && isOpen,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-for-payment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, total_spent')
        .eq('salon_id', user?.id)
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user && isOpen,
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      appointmentId?: string;
      clientName: string;
      amount: number;
      paymentMethod: string;
      description: string;
    }) => {
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('client_payments')
        .insert([{
          salon_id: user?.id,
          client_id: selectedAppointment ? null : null, // We could enhance this to link to client
          amount: paymentData.amount,
          payment_method: paymentData.paymentMethod,
          notes: paymentData.description,
          appointment_id: paymentData.appointmentId
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Create financial transaction
      const { error: transactionError } = await supabase
        .from('financial_transactions')
        .insert([{
          salon_id: user?.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: paymentData.amount,
          description: paymentData.description,
          payment_method: paymentData.paymentMethod,
          reference_type: 'quick_payment',
          reference_id: paymentData.appointmentId
        }]);

      if (transactionError) throw transactionError;

      // Update appointment payment status if applicable
      if (paymentData.appointmentId) {
        const { error: appointmentError } = await supabase
          .from('appointments')
          .update({
            payment_status: 'paid',
            payment_method: paymentData.paymentMethod,
            payment_date: new Date().toISOString()
          })
          .eq('id', paymentData.appointmentId);

        if (appointmentError) throw appointmentError;
      }

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-appointments-payment'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({ title: "Success", description: "Payment recorded successfully!" });
      setSelectedAppointment(null);
      setPaymentAmount('');
      setIsOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to record payment", variant: "destructive" });
    },
  });

  const filteredAppointments = todayAppointments.filter(apt => 
    apt.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unpaidAppointments = filteredAppointments.filter(apt => 
    apt.payment_status !== 'paid'
  );

  const handlePayment = () => {
    if (!selectedAppointment || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    processPaymentMutation.mutate({
      appointmentId: selectedAppointment.id,
      clientName: selectedAppointment.client_name,
      amount,
      paymentMethod,
      description: `Payment for ${selectedAppointment.service} - ${selectedAppointment.client_name}`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            <CreditCard className="w-4 h-4" />
            Quick Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Record Payment - Today's Visits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <Label>Search Appointments</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by client name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="space-y-4">
            <h3 className="font-medium">Today's Completed/In Progress Appointments</h3>
            {unpaidAppointments.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {unpaidAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setPaymentAmount(appointment.price.toString());
                    }}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAppointment?.id === appointment.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{appointment.client_name}</span>
                          <Badge 
                            variant={appointment.status === 'Completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {appointment.service} • {appointment.start_time}
                        </p>
                        {appointment.client_phone && (
                          <p className="text-xs text-gray-500">{appointment.client_phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            ${appointment.price}
                          </span>
                        </div>
                        <Badge 
                          variant="destructive" 
                          className="text-xs mt-1"
                        >
                          Unpaid
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No unpaid appointments found for today</p>
              </div>
            )}
          </div>

          {/* Payment Form */}
          {selectedAppointment && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Payment Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="digital">Digital Payment</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handlePayment}
                  disabled={processPaymentMutation.isPending || !paymentAmount}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {processPaymentMutation.isPending ? 'Processing...' : 'Record Payment'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAppointment(null);
                    setPaymentAmount('');
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
