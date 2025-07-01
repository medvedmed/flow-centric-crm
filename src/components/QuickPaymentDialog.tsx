
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, DollarSign, User, Calendar, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export const QuickPaymentDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [description, setDescription] = useState('');

  // Fetch today's appointments for payment
  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['today-appointments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id)
        .eq('date', today)
        .in('status', ['Completed', 'In Progress'])
        .order('start_time');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && isOpen,
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('salon_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && isOpen,
  });

  // Search clients
  const { data: searchResults = [] } = useQuery({
    queryKey: ['client-search', searchTerm, user?.id],
    queryFn: async () => {
      if (!searchTerm || !user?.id) return [];

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('salon_id', user.id)
        .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!searchTerm && !!user?.id,
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      if (!user?.id) throw new Error('No user');

      // Create financial transaction
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert({
          salon_id: user.id,
          transaction_type: 'income',
          category: 'Service Revenue',
          amount: Number(paymentData.amount),
          description: paymentData.description,
          payment_method: paymentData.paymentMethod,
          transaction_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      // If payment is for a specific appointment, update appointment status
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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['today-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Success',
        description: 'Payment recorded successfully!',
      });
      handleReset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleReset = () => {
    setSelectedClient(null);
    setAmount('');
    setPaymentMethod('');
    setDescription('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleSubmit = () => {
    if (!amount || !paymentMethod) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const paymentData = {
      amount,
      paymentMethod,
      description: description || `Payment from ${selectedClient?.client_name || 'walk-in client'}`,
      appointmentId: selectedClient?.id || null
    };

    processPaymentMutation.mutate(paymentData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
          <DollarSign className="w-4 h-4" />
          Quick Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Today's Appointments */}
          <div>
            <Label className="text-sm font-medium">Today's Appointments</Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {todayAppointments.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedClient?.id === appointment.id 
                      ? 'ring-2 ring-violet-500 bg-violet-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedClient(appointment);
                    setAmount(appointment.price?.toString() || '');
                    setDescription(`Payment for ${appointment.service} - ${appointment.client_name}`);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{appointment.client_name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {appointment.service} • {appointment.start_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${appointment.price}</p>
                        <p className="text-xs text-gray-500">{appointment.payment_status || 'unpaid'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {todayAppointments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No appointments for today</p>
              )}
            </div>
          </div>

          {/* Client Search */}
          <div>
            <Label htmlFor="client-search">Or Search Client</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="client-search"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto border rounded-md">
                {searchResults.map((client) => (
                  <div
                    key={client.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedClient({ client_name: client.name, ...client });
                      setSearchTerm('');
                      setDescription(`Payment from ${client.name}`);
                    }}
                  >
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name}>
                      {method.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Payment description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {selectedClient && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Selected: {selectedClient.client_name}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={processPaymentMutation.isPending}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {processPaymentMutation.isPending ? 'Processing...' : 'Record Payment'}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
