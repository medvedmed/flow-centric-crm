
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, CreditCard, Banknote, Smartphone, Building, Trash2, Edit } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_active: boolean;
  is_default: boolean;
  transaction_count?: number;
  total_amount?: number;
}

const ICON_OPTIONS = [
  { value: 'banknote', label: 'Cash', icon: Banknote },
  { value: 'credit-card', label: 'Card', icon: CreditCard },
  { value: 'smartphone', label: 'Mobile', icon: Smartphone },
  { value: 'building', label: 'Bank', icon: Building },
];

const COLOR_OPTIONS = [
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-500' },
  { value: 'violet', label: 'Violet', bg: 'bg-violet-500' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-500' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-500' },
  { value: 'gray', label: 'Gray', bg: 'bg-gray-500' },
];

export const PaymentMethodsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('salon_id', user.id)
        .order('is_default', { ascending: false })
        .order('name');

      if (error) {
        console.error('Error fetching payment methods:', error);
        throw error;
      }
      return (data || []) as PaymentMethod[];
    },
    enabled: !!user?.id,
  });

  // Create payment method mutation
  const createPaymentMethodMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string; color: string }) => {
      if (!user?.id) throw new Error('No user');
      
      const { data: result, error } = await supabase
        .from('payment_methods')
        .insert([{
          salon_id: user.id,
          name: data.name,
          icon: data.icon,
          color: data.color,
          is_active: true,
          is_default: false
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Success', description: 'Payment method created successfully!' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating payment method:', error);
      toast({ title: 'Error', description: 'Failed to create payment method', variant: 'destructive' });
    },
  });

  // Update payment method mutation
  const updatePaymentMethodMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<PaymentMethod> & { id: string }) => {
      const { error } = await supabase
        .from('payment_methods')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Success', description: 'Payment method updated successfully!' });
      setEditingMethod(null);
    },
    onError: (error) => {
      console.error('Error updating payment method:', error);
      toast({ title: 'Error', description: 'Failed to update payment method', variant: 'destructive' });
    },
  });

  // Delete payment method mutation
  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({ title: 'Success', description: 'Payment method deleted successfully!' });
    },
    onError: (error) => {
      console.error('Error deleting payment method:', error);
      toast({ title: 'Error', description: 'Failed to delete payment method', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
    };

    if (editingMethod) {
      updatePaymentMethodMutation.mutate({ id: editingMethod.id, ...data });
    } else {
      createPaymentMethodMutation.mutate(data);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : CreditCard;
  };

  const getColorClass = (color: string) => {
    return `bg-${color}-500`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 mx-auto border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Payment Methods
          </h2>
          <p className="text-gray-600">Manage your salon's payment options</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add Payment Method</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Payment Method Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Visa, PayPal, Cash"
                  className="bg-white border-gray-300"
                />
              </div>
              
              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ICON_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <label key={option.value} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="icon" value={option.value} required className="sr-only" />
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {COLOR_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="color" value={option.value} required className="sr-only" />
                      <div className={`w-4 h-4 rounded-full ${option.bg}`} />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createPaymentMethodMutation.isPending}>
                  {createPaymentMethodMutation.isPending ? 'Creating...' : 'Create Payment Method'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((method) => {
          const IconComponent = getIconComponent(method.icon);
          
          return (
            <Card key={method.id} className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getColorClass(method.color)} bg-opacity-10`}>
                      <IconComponent className={`w-5 h-5 text-${method.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                      {method.is_default && (
                        <Badge className="bg-violet-100 text-violet-700 border-violet-200">Default</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMethod(method)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={method.is_default}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={method.is_active ? 'default' : 'secondary'}>
                      {method.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {paymentMethods.length === 0 && (
        <Card className="bg-gradient-to-br from-violet-50 to-blue-50 border-violet-200">
          <CardContent className="p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-violet-400" />
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No Payment Methods</h3>
            <p className="text-gray-600 mb-4">Create your first payment method to start tracking transactions.</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
