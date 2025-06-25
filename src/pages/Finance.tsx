/*
 * Enhanced Finance Page with Tailwind-based chart alternative (no chart.js)
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
        <h1 className="text-2xl font-bold text-blue-700">Reports & Analytics</h1>
        <p className="text-gray-500">Analyze your salon performance and business metrics.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <div className={`${cardClass} bg-green-50`}>
          <div className="text-sm font-medium text-green-800">Total Revenue</div>
          <div className="text-2xl font-bold text-green-900">${summary?.totalIncome?.toFixed(2)}</div>
          <div className="text-xs text-gray-500">{transactionList.length} appointments</div>
        </div>
        <div className={`${cardClass} bg-blue-50`}>
          <div className="text-sm font-medium text-blue-800">Total Clients</div>
          <div className="text-2xl font-bold text-blue-900">{summary?.totalClients}</div>
          <div className="text-xs text-gray-500">3 new this month</div>
        </div>
        <div className={`${cardClass} bg-purple-50`}>
          <div className="text-sm font-medium text-purple-800">Avg Per Visit</div>
          <div className="text-2xl font-bold text-purple-900">${summary?.avgPerVisit}</div>
          <div className="text-xs text-gray-500">Per appointment</div>
        </div>
        <div className={`${cardClass} bg-orange-50`}>
          <div className="text-sm font-medium text-orange-800">Returning Clients</div>
          <div className="text-2xl font-bold text-orange-900">{summary?.returningClients}</div>
          <div className="text-xs text-gray-500">This month</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Revenue Trend</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-end gap-4 h-40">
            {revenueData.map((value, i) => (
              <div key={i} className="flex flex-col items-center justify-end h-full">
                <div
                  className="bg-blue-500 w-4 rounded-t"
                  style={{ height: `${(value / maxRevenue) * 100 || 2}%`, minHeight: '2px' }}
                />
                <div className="text-xs mt-1">{months[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6">Transactions</h2>
        <div className="space-y-2 mt-2">
          {transactionList.map((tx) => (
            <div key={tx.id} className="border p-2 rounded-md">
              <span className="font-medium">{tx.category}</span> - <span>${tx.amount}</span>
            </div>
          ))}
          {transactionList.length === 0 && (
            <div className="text-muted-foreground">No transactions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancePageWrapper;
