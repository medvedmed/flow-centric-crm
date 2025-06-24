
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_spent: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Product {
  id: string;
  name: string;
  selling_price: number;
  current_stock: number;
}

export const QuickPaymentSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [paymentItems, setPaymentItems] = useState<Array<{
    type: 'service' | 'product';
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }>>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-quick-payment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, total_spent')
        .eq('salon_id', user?.id)
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user,
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services-quick-payment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, duration')
        .eq('salon_id', user?.id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!user,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-quick-payment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, selling_price, current_stock')
        .eq('salon_id', user?.id)
        .eq('is_active', true)
        .gt('current_stock', 0)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      clientId: string;
      amount: number;
      paymentMethod: string;
      items: typeof paymentItems;
    }) => {
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('client_payments')
        .insert([{
          salon_id: user?.id,
          client_id: paymentData.clientId,
          amount: paymentData.amount,
          payment_method: paymentData.paymentMethod,
          notes: `Quick payment: ${paymentData.items.map(item => `${item.name} (${item.quantity || 1})`).join(', ')}`
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
          description: `Quick payment from ${selectedClient?.name}`,
          payment_method: paymentData.paymentMethod,
          reference_type: 'quick_payment'
        }]);

      if (transactionError) throw transactionError;

      // Update client total spent
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update({
          total_spent: (selectedClient?.total_spent || 0) + paymentData.amount
        })
        .eq('id', paymentData.clientId);

      if (clientUpdateError) throw clientUpdateError;

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients-quick-payment'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: "Success", description: "Payment processed successfully!" });
      setPaymentItems([]);
      setSelectedClient(null);
      setIsPaymentDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to process payment", variant: "destructive" });
    },
  });

  const addService = (service: Service) => {
    setPaymentItems(prev => [...prev, {
      type: 'service',
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1
    }]);
  };

  const addProduct = (product: Product, quantity: number = 1) => {
    setPaymentItems(prev => [...prev, {
      type: 'product',
      id: product.id,
      name: product.name,
      price: product.selling_price,
      quantity
    }]);
  };

  const removeItem = (index: number) => {
    setPaymentItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = paymentItems.reduce((sum, item) => 
    sum + (item.price * (item.quantity || 1)), 0
  );

  const handlePayment = (paymentMethod: string) => {
    if (!selectedClient || paymentItems.length === 0) return;

    processPaymentMutation.mutate({
      clientId: selectedClient.id,
      amount: totalAmount,
      paymentMethod,
      items: paymentItems
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Quick Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Client</Label>
          <Select onValueChange={(value) => {
            const client = clients.find(c => c.id === value);
            setSelectedClient(client || null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a client..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - ${client.total_spent.toFixed(2)} total
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClient && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select onValueChange={(value) => {
                const service = services.find(s => s.id === value);
                if (service) addService(service);
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add service..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select onValueChange={(value) => {
                const product = products.find(p => p.id === value);
                if (product) addProduct(product);
              }}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.selling_price} ({product.current_stock} left)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {paymentItems.length > 0 && (
              <div className="space-y-2">
                <Label>Items to charge:</Label>
                {paymentItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>
                      {item.name} {item.quantity && item.quantity > 1 && `x${item.quantity}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handlePayment('cash')}
                    disabled={processPaymentMutation.isPending}
                    className="flex-1"
                  >
                    Cash Payment
                  </Button>
                  <Button
                    onClick={() => handlePayment('card')}
                    disabled={processPaymentMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    Card Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
