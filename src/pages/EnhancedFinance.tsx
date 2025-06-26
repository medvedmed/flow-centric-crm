import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Filter, Download, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { financeApi } from '@/services/api/financeApi';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const EnhancedFinance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | ''>('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  console.log('EnhancedFinance component rendering');

  // Enable real-time updates
  useRealTimeUpdates();

  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ['financial-transactions', dateRange.start, dateRange.end, transactionType, selectedCategory, currentPage],
    queryFn: () => financeApi.getTransactions(
      dateRange.start || undefined,
      dateRange.end || undefined,
      transactionType || undefined,
      selectedCategory || undefined,
      currentPage,
      pageSize
    ),
    retry: 1,
    retryDelay: 1000,
  });

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['financial-summary', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getFinancialSummary(
      dateRange.start || undefined,
      dateRange.end || undefined
    ),
    retry: 1,
    retryDelay: 1000,
  });

  const { data: incomeCategories = [], error: incomeCategoriesError } = useQuery({
    queryKey: ['income-categories', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getCategorySummary('income', dateRange.start || undefined, dateRange.end || undefined),
    retry: 1,
    retryDelay: 1000,
  });

  const { data: expenseCategories = [], error: expenseCategoriesError } = useQuery({
    queryKey: ['expense-categories', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getCategorySummary('expense', dateRange.start || undefined, dateRange.end || undefined),
    retry: 1,
    retryDelay: 1000,
  });

  const createTransactionMutation = useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['income-categories'] });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast({ title: 'Success', description: 'Transaction created successfully!' });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      console.error('Create transaction mutation error:', error);
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

    console.log('Creating transaction with data:', transactionData);
    createTransactionMutation.mutate(transactionData);
  };

  const transactions = transactionsData?.data || [];
  const totalPages = transactionsData?.totalPages || 1;

  const chartData = [
    { name: 'Income', value: summary?.totalIncome || 0, fill: '#00C49F' },
    { name: 'Expenses', value: summary?.totalExpenses || 0, fill: '#FF8042' },
  ];

  // Check for any errors
  const hasError = transactionsError || summaryError || incomeCategoriesError || expenseCategoriesError;
  const isLoading = transactionsLoading && summaryLoading;

  if (isLoading) {
    console.log('Finance page loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    console.error('Finance page error:', { transactionsError, summaryError, incomeCategoriesError, expenseCategoriesError });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Financial Data</h2>
            <p className="text-gray-600 mb-4">Failed to load financial information. Please try again.</p>
            <p className="text-sm text-gray-500 mb-4">
              Error: {hasError instanceof Error ? hasError.message : 'Unknown error'}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Finance page rendered successfully');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground mt-1">Track income, expenses, and financial performance</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transaction_type">Type *</Label>
                  <Select name="transaction_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input id="category" name="category" required />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select name="payment_method">
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="transaction_date">Date</Label>
                  <Input 
                    id="transaction_date" 
                    name="transaction_date" 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createTransactionMutation.isPending}>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary?.totalIncome?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${summary?.totalExpenses?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className={`text-2xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${summary?.netProfit?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold">
                  {summary?.transactionCount || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[...incomeCategories, ...expenseCategories]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="type_filter">Type</Label>
              <Select value={transactionType} onValueChange={(value: any) => setTransactionType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category_filter">Category</Label>
              <Input
                id="category_filter"
                placeholder="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'}>
                    {transaction.transaction_type}
                  </Badge>
                  <div>
                    <p className="font-medium">{transaction.category}</p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.transaction_type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{transaction.payment_method}</p>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
                <p className="text-gray-600">Start by adding your first transaction.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFinance;
