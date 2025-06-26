
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const IncomeExpenseBreakdown = () => {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<'income' | 'expenses'>('income');

  const { data: breakdownData, isLoading } = useQuery({
    queryKey: ['finance-breakdown', viewType],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from('finance_transactions')
        .select('category, amount, transaction_type')
        .eq('salon_id', user?.id)
        .eq('transaction_type', viewType === 'income' ? 'income' : 'expense');

      if (error) throw error;

      // Group by category and calculate totals
      const categoryTotals = new Map();
      let grandTotal = 0;

      transactions?.forEach(transaction => {
        const amount = Number(transaction.amount);
        grandTotal += amount;
        
        if (!categoryTotals.has(transaction.category)) {
          categoryTotals.set(transaction.category, 0);
        }
        categoryTotals.set(transaction.category, categoryTotals.get(transaction.category) + amount);
      });

      // Convert to array with percentages
      const categoryData = Array.from(categoryTotals.entries())
        .map(([category, amount]) => ({
          category,
          amount: Number(amount),
          percentage: grandTotal > 0 ? (Number(amount) / grandTotal) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        categories: categoryData,
        total: grandTotal
      };
    },
    enabled: !!user
  });

  const colors = [
    '#10B981', // Green
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
  ];

  const chartData = breakdownData?.categories.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  })) || [];

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {viewType === 'income' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            {viewType === 'income' ? 'Income' : 'Expenses'} Breakdown
          </div>
          
          {/* Toggle Buttons */}
          <div className="flex items-center bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewType === 'income' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('income')}
              className={`text-xs ${
                viewType === 'income' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Income
            </Button>
            <Button
              variant={viewType === 'expenses' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('expenses')}
              className={`text-xs ${
                viewType === 'expenses' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Expenses
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6">
          {/* Pie Chart */}
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="flex-1 space-y-3">
            {breakdownData?.categories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-gray-300 text-sm">{category.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    ${category.amount.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}

            {breakdownData?.categories.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400">
                  No {viewType} data available
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  Start adding {viewType} transactions to see the breakdown
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        {breakdownData && breakdownData.total > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total {viewType}</span>
              <span className={`text-lg font-bold ${
                viewType === 'income' ? 'text-green-400' : 'text-red-400'
              }`}>
                ${breakdownData.total.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
