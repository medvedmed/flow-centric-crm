
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermissions } from '@/hooks/usePermissions';
import { Shield, DollarSign, TrendingUp, TrendingDown, Calculator, Zap } from 'lucide-react';
import { PaymentTracker } from '@/components/PaymentTracker';
import { QuickPaymentInterface } from '@/components/QuickPaymentInterface';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '@/services/api/financeApi';

const Finance = () => {
  const { hasPermissionSync } = usePermissions();
  const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});

  const canViewFinance = hasPermissionSync('reports', 'view');

  // Fetch financial summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getFinancialSummary(dateRange.start, dateRange.end)
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial-transactions', dateRange.start, dateRange.end],
    queryFn: () => financeApi.getTransactions(dateRange.start, dateRange.end, undefined, undefined, 1, 20)
  });

  if (!canViewFinance) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to view financial data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Management</h1>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summaryLoading ? '...' : formatCurrency(summary?.totalIncome || 0)}
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
              {summaryLoading ? '...' : formatCurrency(summary?.totalExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summaryLoading ? '...' : formatCurrency(summary?.netProfit || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? '...' : summary?.transactionCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="quick-payment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-payment" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Payment
          </TabsTrigger>
          <TabsTrigger value="payments">Real-Time Payments</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-payment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickPaymentInterface />
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground mb-4">
                  Use this interface to quickly record payments from walk-in clients or process pending appointment payments.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cash Sale
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Product Sale
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentTracker />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : transactions?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions?.data.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{transaction.category}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.transaction_type === 'income' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.transaction_type}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.transaction_date} • {transaction.payment_method}
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.transaction_type === 'income' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced financial reports and analytics coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
