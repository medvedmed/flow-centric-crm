
import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="text-center text-red-500 py-10">
      <p>Something went wrong.</p>
      <pre className="text-sm mt-2">{error.message}</pre>
    </div>
  );
}

const financeApi = {
  getFinancialSummary: async () => {
    return {
      totalIncome: 5000,
      totalExpenses: 3000,
      netProfit: 2000,
      totalClients: 3,
      returningClients: 0,
      avgPerVisit: 0
    };
  },
  getTransactions: async () => {
    return {
      data: [
        { id: '1', category: 'Product Sales', amount: 1200 },
        { id: '2', category: 'Rent', amount: 800 }
      ]
    };
  }
};

const queryClient = new QueryClient();

function FinancePageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <FinanceWithPermissions />
    </QueryClientProvider>
  );
}

function FinanceWithPermissions() {
  const { hasPermissionSync, isLoading: permissionsLoading } = usePermissions();

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading permissions...</span>
        </div>
      </div>
    );
  }

  const canViewFinance = hasPermissionSync('finance', 'view');

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

  return <FinanceWithFallback />;
}

function FinanceWithFallback() {
  try {
    return <Finance />;
  } catch (error: any) {
    return <ErrorFallback error={error} />;
  }
}

function Finance() {
  const {
    data: summary,
    isError: summaryError,
    isLoading: summaryLoading
  } = useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => financeApi.getFinancialSummary()
  });

  const {
    data: transactionsData,
    isError: transactionsError,
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: ['financial-transactions'],
    queryFn: () => financeApi.getTransactions()
  });

  if (summaryLoading || transactionsLoading) {
    return <div className="text-center py-10">Loading finance data...</div>;
  }

  if (summaryError || transactionsError) {
    return <div className="text-center text-red-500 py-10">Failed to load financial data</div>;
  }

  const transactionList = Array.isArray(transactionsData?.data) ? transactionsData.data : [];

  const cardClass = "rounded-xl shadow-sm p-4 w-full sm:w-48 text-center";

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueData = [0, 0, 0, 0, 0, summary?.totalIncome || 0];
  const maxRevenue = Math.max(...revenueData);

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-700">Financial Dashboard</h1>
        <p className="text-gray-500">Monitor your salon's financial performance and metrics.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <div className={`${cardClass} bg-green-50`}>
          <div className="text-sm font-medium text-green-800">Total Revenue</div>
          <div className="text-2xl font-bold text-green-900">${summary?.totalIncome?.toFixed(2)}</div>
          <div className="text-xs text-gray-500">{transactionList.length} transactions</div>
        </div>
        <div className={`${cardClass} bg-blue-50`}>
          <div className="text-sm font-medium text-blue-800">Total Expenses</div>
          <div className="text-2xl font-bold text-blue-900">${summary?.totalExpenses?.toFixed(2)}</div>
        </div>
        <div className={`${cardClass} bg-purple-50`}>
          <div className="text-sm font-medium text-purple-800">Net Profit</div>
          <div className="text-2xl font-bold text-purple-900">${summary?.netProfit?.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

export default FinancePageWrapper;
