
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';

type PeriodType = 'D' | 'W' | 'M' | 'Y';

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('D');

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['finance-analytics', selectedPeriod],
    queryFn: async () => {
      let startDate: Date;
      let endDate = new Date();
      
      switch (selectedPeriod) {
        case 'D':
          startDate = subDays(endDate, 30);
          break;
        case 'W':
          startDate = subWeeks(endDate, 12);
          break;
        case 'M':
          startDate = subMonths(endDate, 12);
          break;
        case 'Y':
          startDate = subYears(endDate, 5);
          break;
        default:
          startDate = subDays(endDate, 30);
      }

      const { data: transactions, error } = await supabase
        .from('finance_transactions')
        .select('*')
        .eq('salon_id', user?.id)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .order('transaction_date');

      if (error) throw error;

      // Group data by period
      const groupedData = new Map();
      
      transactions?.forEach(transaction => {
        let periodKey: string;
        const date = new Date(transaction.transaction_date);
        
        switch (selectedPeriod) {
          case 'D':
            periodKey = format(date, 'MMM dd');
            break;
          case 'W':
            periodKey = `Week ${format(date, 'w')}`;
            break;
          case 'M':
            periodKey = format(date, 'MMM yyyy');
            break;
          case 'Y':
            periodKey = format(date, 'yyyy');
            break;
          default:
            periodKey = format(date, 'MMM dd');
        }

        if (!groupedData.has(periodKey)) {
          groupedData.set(periodKey, {
            period: periodKey,
            income: 0,
            expenses: 0,
            profit: 0,
            date: transaction.transaction_date
          });
        }

        const group = groupedData.get(periodKey);
        if (transaction.transaction_type === 'income') {
          group.income += Number(transaction.amount);
        } else {
          group.expenses += Number(transaction.amount);
        }
        group.profit = group.income - group.expenses;
      });

      const chartData = Array.from(groupedData.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate totals and trends
      const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
      const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
      const totalProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;

      // Calculate forecast (simple trend based on last 3 periods)
      const lastThreePeriods = chartData.slice(-3);
      const avgGrowth = lastThreePeriods.length > 1 
        ? (lastThreePeriods[lastThreePeriods.length - 1].profit - lastThreePeriods[0].profit) / (lastThreePeriods.length - 1)
        : 0;

      const forecastData = chartData.map((item, index) => ({
        ...item,
        forecast: index >= chartData.length - 3 ? item.profit + avgGrowth : null
      }));

      return {
        chartData: forecastData,
        totalIncome,
        totalExpenses,
        totalProfit,
        profitMargin,
        transactions: transactions || []
      };
    },
    enabled: !!user
  });

  const periods = [
    { key: 'D' as PeriodType, label: 'D', fullLabel: 'Daily' },
    { key: 'W' as PeriodType, label: 'W', fullLabel: 'Weekly' },
    { key: 'M' as PeriodType, label: 'M', fullLabel: 'Monthly' },
    { key: 'Y' as PeriodType, label: 'Y', fullLabel: 'Yearly' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
          {periods.map((period) => (
            <Button
              key={period.key}
              variant={selectedPeriod === period.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod(period.key)}
              className={`min-w-[40px] ${
                selectedPeriod === period.key 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Profit</div>
            <div className={`text-xl font-bold ${analyticsData?.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${analyticsData?.totalProfit?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Profit Margin</div>
            <div className={`text-xl font-bold flex items-center gap-1 ${analyticsData?.profitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {analyticsData?.profitMargin >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {analyticsData?.profitMargin?.toFixed(1) || '0.0'}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Income vs Expenses - {periods.find(p => p.key === selectedPeriod)?.fullLabel} View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="period" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any, name: string) => [
                    `$${Number(value).toLocaleString()}`,
                    name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : name === 'forecast' ? 'Forecast' : name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
                  name="income"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 0, r: 4 }}
                  name="expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 3 }}
                  connectNulls={false}
                  name="forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart for detailed view */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="period" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any, name: string) => [
                    `$${Number(value).toLocaleString()}`,
                    name === 'income' ? 'Income' : 'Expenses'
                  ]}
                />
                <Bar dataKey="income" fill="#10B981" name="income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" name="expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
