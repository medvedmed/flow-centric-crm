
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi, CreateTransaction } from '@/services/api/financeApi';
import { toast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, TrendingDown, Plus, Filter, Download } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function Finance() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all'
  });

  const [newTransaction, setNewTransaction] = useState<CreateTransaction>({
    transaction_type: 'income',
    category: '',
    amount: 0,
    description: '',
    payment_method: 'cash',
    transaction_date: format(new Date(), 'yyyy-MM-dd')
  });

  const queryClient = useQueryClient();

  // Fetch financial summary
  const { data: summary } = useQuery({
    queryKey: ['financial-summary', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getFinancialSummary(dateRange.start, dateRange.end)
  });

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['financial-transactions', dateRange.start, dateRange.end, filters.type, filters.category],
    queryFn: () => financeApi.getTransactions(
      dateRange.start,
      dateRange.end,
      filters.type === 'all' ? undefined : filters.type as 'income' | 'expense',
      filters.category === 'all' ? undefined : filters.category
    )
  });

  // Fetch category summaries
  const { data: incomeCategories } = useQuery({
    queryKey: ['income-categories', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getCategorySummary('income', dateRange.start, dateRange.end)
  });

  const { data: expenseCategories } = useQuery({
    queryKey: ['expense-categories', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getCategorySummary('expense', dateRange.start, dateRange.end)
  });

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['income-categories'] });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      setIsAddDialogOpen(false);
      setNewTransaction({
        transaction_type: 'income',
        category: '',
        amount: 0,
        description: '',
        payment_method: 'cash',
        transaction_date: format(new Date(), 'yyyy-MM-dd')
      });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
    }
  });

  const handleCreateTransaction = () => {
    if (!newTransaction.category || newTransaction.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(newTransaction);
  };

  const commonIncomeCategories = ['Service Revenue', 'Product Sales', 'Tips', 'Other Income'];
  const commonExpenseCategories = ['Rent', 'Utilities', 'Supplies', 'Staff Salary', 'Marketing', 'Equipment', 'Other Expenses'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">Track income, expenses, and financial performance</p>
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={newTransaction.transaction_type} 
                    onValueChange={(value: 'income' | 'expense') => 
                      setNewTransaction({ ...newTransaction, transaction_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select 
                    value={newTransaction.category} 
                    onValueChange={(value) => 
                      setNewTransaction({ ...newTransaction, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(newTransaction.transaction_type === 'income' ? commonIncomeCategories : commonExpenseCategories)
                        .map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => 
                      setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newTransaction.transaction_date}
                    onChange={(e) => 
                      setNewTransaction({ ...newTransaction, transaction_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select 
                  value={newTransaction.payment_method} 
                  onValueChange={(value) => 
                    setNewTransaction({ ...newTransaction, payment_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newTransaction.description}
                  onChange={(e) => 
                    setNewTransaction({ ...newTransaction, description: e.target.value })
                  }
                  placeholder="Transaction description..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateTransaction}
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? "Adding..." : "Add Transaction"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary?.totalIncome?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary?.totalExpenses?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary?.netProfit?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Badge variant="secondary">{summary?.transactionCount || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.transactionCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-40"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-40"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : (
                <div className="space-y-4">
                  {transactionsData?.data.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.transaction_type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium">{transaction.description || transaction.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.category} • {transaction.payment_method} • {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  {transactionsData?.data.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No transactions found for the selected period
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Income Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incomeCategories?.map((category) => (
                    <div key={category.category} className="flex justify-between items-center">
                      <span>{category.category}</span>
                      <span className="font-semibold text-green-600">
                        ${category.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {incomeCategories?.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No income recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseCategories?.map((category) => (
                    <div key={category.category} className="flex justify-between items-center">
                      <span>{category.category}</span>
                      <span className="font-semibold text-red-600">
                        ${category.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {expenseCategories?.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No expenses recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Export Financial Reports</p>
                <p className="text-muted-foreground mb-4">
                  Generate detailed financial reports for accounting and analysis
                </p>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export to PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
