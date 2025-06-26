
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['finance-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .eq('salon_id', user?.id)
        .order('category_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && open
  });

  const { data: accounts } = useQuery({
    queryKey: ['finance-accounts-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_accounts')
        .select('account_name')
        .eq('salon_id', user?.id)
        .eq('is_active', true)
        .order('account_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && open
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const transactionData = {
        salon_id: user?.id,
        transaction_type: formData.get('transaction_type') as string,
        client_name: formData.get('client_name') as string || null,
        amount: parseFloat(formData.get('amount') as string),
        payment_method: formData.get('payment_method') as string,
        category: formData.get('category') as string,
        description: formData.get('description') as string || null,
        transaction_date: formData.get('transaction_date') as string,
        is_tip: formData.get('is_tip') === 'true'
      };

      const { data, error } = await supabase
        .from('finance_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['finance-all-operations'] });
      queryClient.invalidateQueries({ queryKey: ['finance-breakdown'] });
      queryClient.invalidateQueries({ queryKey: ['finance-accounts'] });
      toast({ title: 'Success', description: 'Transaction created successfully!' });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Create transaction error:', error);
      toast({ title: 'Error', description: 'Failed to create transaction', variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createTransactionMutation.mutate(formData);
  };

  const incomeCategories = categories?.filter(c => c.category_type === 'income') || [];
  const expenseCategories = categories?.filter(c => c.category_type === 'expense') || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Financial Operation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transaction Type */}
            <div>
              <Label htmlFor="transaction_type" className="text-gray-300">Type *</Label>
              <Select name="transaction_type" required>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="income" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Income
                    </div>
                  </SelectItem>
                  <SelectItem value="expense" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Expense
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="text-gray-300">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="0.00"
              />
            </div>

            {/* Client Name */}
            <div>
              <Label htmlFor="client_name" className="text-gray-300">Client Name</Label>
              <Input
                id="client_name"
                name="client_name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="Client name (optional)"
              />
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="payment_method" className="text-gray-300">Payment Method *</Label>
              <Select name="payment_method" required>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {accounts?.map((account) => (
                    <SelectItem 
                      key={account.account_name} 
                      value={account.account_name}
                      className="text-white hover:bg-gray-700"
                    >
                      {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-gray-300">Category *</Label>
              <Select name="category" required>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {incomeCategories.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-green-400 uppercase tracking-wider">
                        Income
                      </div>
                      {incomeCategories.map((category) => (
                        <SelectItem 
                          key={`income-${category.category_name}`} 
                          value={category.category_name}
                          className="text-white hover:bg-gray-700"
                        >
                          {category.category_name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {expenseCategories.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-red-400 uppercase tracking-wider">
                        Expenses
                      </div>
                      {expenseCategories.map((category) => (
                        <SelectItem 
                          key={`expense-${category.category_name}`} 
                          value={category.category_name}
                          className="text-white hover:bg-gray-700"
                        >
                          {category.category_name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Date */}
            <div>
              <Label htmlFor="transaction_date" className="text-gray-300">Date *</Label>
              <Input
                id="transaction_date"
                name="transaction_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              placeholder="Optional description or notes..."
            />
          </div>

          {/* Tip Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_tip"
              name="is_tip"
              value="true"
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="is_tip" className="text-gray-300">This is a tip</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createTransactionMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createTransactionMutation.isPending ? 'Creating...' : 'Create Operation'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
