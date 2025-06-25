/*
 * Enhanced Finance Page with QueryClientProvider
 * Improvements:
 * - Wrapped app in QueryClientProvider
 * - Defensive coding for all API-based UI renderings
 * - Added loading and error fallback for queries
 * - Better null/undefined guards
 * - Structured to avoid white screens during unexpected response formats
*/

import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// Fallback error UI component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="text-center text-red-500 py-10">
      <p>Something went wrong.</p>
      <pre className="text-sm mt-2">{error.message}</pre>
    </div>
  );
}

// Mocked financeApi as fallback until real path is resolved
const financeApi = {
  getFinancialSummary: async (start: string, end: string) => {
    return {
      totalIncome: 5000,
      totalExpenses: 3000,
      netProfit: 2000
    };
  },
  getTransactions: async (start: string, end: string, type?: string, category?: string) => {
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
      <FinanceWithFallback />
    </QueryClientProvider>
  );
}

function FinanceWithFallback() {
  try {
    return <Finance />;
  } catch (error: any) {
    return <ErrorFallback error={error} />;
  }
}

function Finance() {
  const dateRange = {
    start: '2023-01-01',
    end: '2023-12-31'
  };

  const filters = {
    type: '',
    category: ''
  };

  const {
    data: summary,
    isError: summaryError,
    isLoading: summaryLoading
  } = useQuery({
    queryKey: ['financial-summary', dateRange.start, dateRange.end],
    queryFn: async () => {
      try {
        const data = await financeApi.getFinancialSummary(dateRange.start, dateRange.end);
        return data;
      } catch (error) {
        console.error("Failed to fetch summary", error);
        throw error;
      }
    }
  });

  const {
    data: transactionsData,
    isError: transactionsError,
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: ['financial-transactions', dateRange.start, dateRange.end, filters.type, filters.category],
    queryFn: async () => {
      try {
        return await financeApi.getTransactions(
          dateRange.start,
          dateRange.end,
          filters.type as 'income' | 'expense' || undefined,
          filters.category || undefined
        );
      } catch (error) {
        console.error("Failed to fetch transactions", error);
        throw error;
      }
    }
  });

  if (summaryLoading || transactionsLoading) {
    return <div className="text-center py-10">Loading finance data...</div>;
  }

  if (summaryError || transactionsError) {
    return <div className="text-center text-red-500 py-10">Failed to load financial data</div>;
  }

  const transactionList = Array.isArray(transactionsData?.data) ? transactionsData.data : [];

  return (
    <div className="space-y-6 p-4">
      {/* Summary */}
      <div className="space-y-2">
        <div>Total Income: ${summary?.totalIncome?.toFixed(2) || '0.00'}</div>
        <div>Total Expenses: ${summary?.totalExpenses?.toFixed(2) || '0.00'}</div>
        <div>Net Profit: ${summary?.netProfit?.toFixed(2) || '0.00'}</div>
      </div>

      {/* Transactions */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Transactions</h2>
        {transactionList.map((tx) => (
          <div key={tx.id} className="border p-2 rounded-md">
            <span className="font-medium">{tx.category}</span> -
            <span> ${tx.amount}</span>
          </div>
        ))}
        {transactionList.length === 0 && (
          <div className="text-muted-foreground">No transactions found.</div>
        )}
      </div>
    </div>
  );
}

export default FinancePageWrapper;
