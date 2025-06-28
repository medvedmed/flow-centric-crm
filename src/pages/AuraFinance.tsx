
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, Banknote, Smartphone, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { financeApi } from '@/services/api/financeApi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethodsManager } from '@/components/finance/PaymentMethodsManager';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AURA_COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

const AuraFinance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | ''>('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

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
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch transactions with enhanced data
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions', dateRange.start, dateRange.end, transactionType, selectedCategory, currentPage],
    queryFn: () => financeApi.getTransactions(
      dateRange.start || undefined,
      dateRange.end || undefined,
      transactionType || undefined,
      selectedCategory || undefined,
      currentPage,
      pageSize
    ),
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getFinancialSummary(
      dateRange.start || undefined,
      dateRange.end || undefined
    ),
  });

  const { data: paymentMethodStats = [] } = useQuery({
    queryKey: ['payment-method-stats', user?.id, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('financial_transactions')
        .select('payment_method, amount, transaction_type')
        .eq('salon_id', user.id);

      if (dateRange.start) query = query.gte('transaction_date', dateRange.start);
      if (dateRange.end) query = query.lte('transaction_date', dateRange.end);

      const { data, error } = await query;
      if (error) throw error;

      // Group by payment method
      const stats = data?.reduce((acc: any, transaction) => {
        const method = transaction.payment_method || 'Unknown';
        if (!acc[method]) {
          acc[method] = { method, income: 0, expense: 0, total: 0, count: 0 };
        }
        
        const amount = Number(transaction.amount);
        if (transaction.transaction_type === 'income') {
          acc[method].income += amount;
        } else {
          acc[method].expense += amount;
        }
        acc[method].total += amount;
        acc[method].count += 1;
        
        return acc;
      }, {});

      return Object.values(stats || {});
    },
    enabled: !!user?.id,
  });

  const createTransactionMutation = useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payment-method-stats'] });
      toast({ title: 'Success', description: 'Transaction created successfully!' });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create transaction', variant: 'destructive' });
    },
  });

  const handleCreateTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const transactionData = {
      transaction_type: formData.get('transaction_type') as 'income' | 'expense',
      category: formData.get('category') as string,
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string,
      payment_method: formData.get('payment_method') as string,
      transaction_date: formData.get('transaction_date') as string,
    };

    createTransactionMutation.mutate(transactionData);
  };

  const getPaymentMethodIcon = (method: string) => {
    const paymentMethod = paymentMethods.find(pm => pm.name === method);
    if (!paymentMethod) return CreditCard;
    
    switch (paymentMethod.icon) {
      case 'banknote': return Banknote;
      case 'smartphone': return Smartphone;
      case 'building': return Building;
      default: return CreditCard;
    }
  };

  const transactions = transactionsData?.data || [];
  const totalPages = transactionsData?.totalPages || 1;

  if (transactionsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-blue-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-900">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Aura Finance
            </h1>
            <p className="text-gray-600 mt-1">Beautiful financial management for your salon</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Add New Transaction
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTransaction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transaction_type">Type *</Label>
                    <Select name="transaction_type" required>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="payment_method">Payment Method *</Label>
                    <Select name="payment_method" required>
                      <SelectTrigger className="bg-white border-gray-300">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {paymentMethods.map((method) => {
                          const IconComponent = getPaymentMethodIcon(method.name);
                          return (
                            <SelectItem key={method.id} value={method.name}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {method.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input id="category" name="category" required className="bg-white border-gray-300" />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required className="bg-white border-gray-300" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="transaction_date">Date</Label>
                    <Input 
                      id="transaction_date" 
                      name="transaction_date" 
                      type="date" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" className="bg-white border-gray-300" />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createTransactionMutation.isPending}
                    className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                  >
                    {createTransactionMutation.isPending ? 'Creating...' : 'Create Transaction'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-white to-emerald-50 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Income</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        ${summary?.totalIncome?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-red-50 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                      <p className="text-3xl font-bold text-red-600">
                        ${summary?.totalExpenses?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-violet-50 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Profit</p>
                      <p className={`text-3xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                        ${summary?.netProfit?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="p-3 bg-violet-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-blue-50 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Transactions</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {summary?.transactionCount || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods Stats */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Payment Methods Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentMethodStats.map((stat: any, index: number) => {
                    const IconComponent = getPaymentMethodIcon(stat.method);
                    return (
                      <div key={stat.method} className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-violet-100 rounded-lg">
                            <IconComponent className="w-5 h-5 text-violet-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{stat.method}</h3>
                            <p className="text-sm text-gray-600">{stat.count} transactions</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Income:</span>
                            <span className="font-medium text-emerald-600">${stat.income.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expenses:</span>
                            <span className="font-medium text-red-600">${stat.expense.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-methods">
            <PaymentMethodsManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    Payment Method Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethodStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, total }) => `${method}: $${total.toFixed(2)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                      >
                        {paymentMethodStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={AURA_COLORS[index % AURA_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    Payment Methods Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={paymentMethodStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="income" fill="#10B981" name="Income" />
                      <Bar dataKey="expense" fill="#EF4444" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuraFinance;
