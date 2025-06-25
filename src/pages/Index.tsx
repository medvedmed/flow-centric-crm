/*
 * Enhanced Finance Page with Clean UI Styling
 * Improvements:
 * - Wrapped app in QueryClientProvider
 * - Responsive card layout for summary
 * - Tailwind spacing, shadow, and UI polish
*/

import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="text-center text-red-500 py-10">
      <p>Something went wrong.</p>
      <pre className="text-sm mt-2">{error.message}</pre>
    </div>
  );
}

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
      const data = await financeApi.getFinancialSummary(dateRange.start, dateRange.end);
      return data;
    }
  });

  const {
    data: transactionsData,
    isError: transactionsError,
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: ['financial-transactions', dateRange.start, dateRange.end, filters.type, filters.category],
    queryFn: async () => {
      return await financeApi.getTransactions(
        dateRange.start,
        dateRange.end,
        filters.type as 'income' | 'expense' || undefined,
        filters.category || undefined
      );
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
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-green-800">Total Income</p>
          <p className="text-xl font-bold text-green-900">${summary?.totalIncome?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-red-800">Total Expenses</p>
          <p className="text-xl font-bold text-red-900">${summary?.totalExpenses?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-blue-800">Net Profit</p>
          <p className={`text-xl font-bold ${summary?.netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>${summary?.netProfit?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Recent Transactions</h2>
        {transactionList.length === 0 ? (
          <div className="text-gray-400">No transactions found.</div>
        ) : (
          <ul className="divide-y divide-gray-200 border rounded-lg bg-white">
            {transactionList.map((tx) => (
              <li key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-700">{tx.category}</p>
                  <p className="text-sm text-gray-400">ID: {tx.id}</p>
                </div>
                <div className="text-right font-bold text-gray-700">${tx.amount}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default FinancePageWrapper;