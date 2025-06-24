
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, DollarSign, CreditCard, Banknote, Receipt, User } from 'lucide-react';

interface QuickPaymentInterfaceProps {
  className?: string;
}

export const QuickPaymentInterface: React.FC<QuickPaymentInterfaceProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Service Payment');

  const queryClient = useQueryClient();

  // Search for clients and appointments
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['client-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      // Search both clients and appointments
      const [clientsResult, appointmentsResult] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .eq('salon_id', profile.user.id)
          .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .limit(5),
        supabase
          .from('appointments')
          .select('*')
          .eq('salon_id', profile.user.id)
          .eq('status', 'Completed')
          .or(`client_name.ilike.%${searchTerm}%,client_phone.ilike.%${searchTerm}%`)
          .is('payment_status', null)
          .limit(5)
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (appointmentsResult.error) throw appointmentsResult.error;

      return {
        clients: clientsResult.data || [],
        appointments: appointmentsResult.data || []
      };
    },
    enabled: searchTerm.length >= 2,
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error('User not authenticated');

      // Create financial transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('financial_transactions')
        .insert([{
          salon_id: profile.user.id,
          transaction_type: 'income',
          category: paymentData.category,
          amount: paymentData.amount,
          description: paymentData.description,
          payment_method: paymentData.method,
          reference_id: paymentData.referenceId,
          reference_type: paymentData.referenceType,
          transaction_date: new Date().toISOString().split('T')[0],
          created_by: profile.user.id
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // If this is for an appointment, update it
      if (paymentData.referenceType === 'appointment' && paymentData.referenceId) {
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ 
            notes: `Payment received: $${paymentData.amount} via ${paymentData.method}`
          })
          .eq('id', paymentData.referenceId);

        if (updateError) console.warn('Failed to update appointment:', updateError);
      }

      return transaction;
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Recorded",
        description: `Payment of $${data.amount} recorded successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSearchTerm('');
    setSelectedClient(null);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setDescription('');
    setCategory('Service Payment');
  };

  const handleSelectClient = (item: any, type: 'client' | 'appointment') => {
    if (type === 'client') {
      setSelectedClient({ ...item, type: 'client' });
      setDescription(`Service payment for ${item.name}`);
    } else {
      setSelectedClient({ ...item, type: 'appointment' });
      setPaymentAmount(item.price.toString());
      setDescription(`Payment for ${item.service} - ${item.client_name}`);
    }
    setSearchTerm('');
  };

  const handleProcessPayment = () => {
    if (!paymentAmount || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in payment amount and description",
        variant: "destructive",
      });
      return;
    }

    const paymentData = {
      amount: parseFloat(paymentAmount),
      method: paymentMethod,
      description,
      category,
      referenceId: selectedClient?.type === 'appointment' ? selectedClient.id : null,
      referenceType: selectedClient?.type === 'appointment' ? 'appointment' : 'manual'
    };

    processPaymentMutation.mutate(paymentData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Quick Payment Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client/Appointment Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Client or Appointment</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter client name, phone, or appointment details..."
              className="pl-10"
            />
          </div>
          
          {/* Search Results */}
          {searchTerm.length >= 2 && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {isSearching ? (
                <div className="p-3 text-center text-muted-foreground">Searching...</div>
              ) : (
                <div className="space-y-1">
                  {searchResults.clients?.map((client: any) => (
                    <div
                      key={`client-${client.id}`}
                      onClick={() => handleSelectClient(client, 'client')}
                      className="p-3 hover:bg-muted cursor-pointer border-b"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.phone} • {client.email}
                          </div>
                        </div>
                        <Badge variant="outline">Client</Badge>
                      </div>
                    </div>
                  ))}
                  {searchResults.appointments?.map((appointment: any) => (
                    <div
                      key={`appointment-${appointment.id}`}
                      onClick={() => handleSelectClient(appointment, 'appointment')}
                      className="p-3 hover:bg-muted cursor-pointer border-b"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{appointment.client_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.service} • {appointment.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(appointment.price)}</div>
                          <Badge variant="outline">Unpaid</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!searchResults.clients?.length && !searchResults.appointments?.length) && (
                    <div className="p-3 text-center text-muted-foreground">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Client/Appointment */}
        {selectedClient && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {selectedClient.type === 'client' ? selectedClient.name : selectedClient.client_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedClient.type === 'appointment' 
                    ? `${selectedClient.service} • ${selectedClient.date}`
                    : 'Manual payment entry'
                  }
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClient(null)}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Service Payment">Service Payment</SelectItem>
              <SelectItem value="Product Sale">Product Sale</SelectItem>
              <SelectItem value="Package Sale">Package Sale</SelectItem>
              <SelectItem value="Gift Card Sale">Gift Card Sale</SelectItem>
              <SelectItem value="Other Income">Other Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment description..."
            rows={2}
          />
        </div>

        <Button
          onClick={handleProcessPayment}
          disabled={processPaymentMutation.isPending || !paymentAmount || !description}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {processPaymentMutation.isPending ? 'Processing...' : 'Record Payment'}
        </Button>
      </CardContent>
    </Card>
  );
};
