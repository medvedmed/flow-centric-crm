
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  ArrowUp, 
  ArrowDown,
  PieChart,
  BarChart3,
  CreditCard,
  Wallet
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

interface FinanceData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyChange: number;
  transactions: any[];
  monthlyData: any[];
  categoryData: any[];
}

export const LightFinanceUI: React.FC = () => {
  const [financeData, setFinanceData] = useState<FinanceData>({
    totalRevenue: 45280,
    totalExpenses: 18340,
    netProfit: 26940,
    monthlyChange: 12.5,
    transactions: [
      { id: 1, description: 'Hair Cut Service', amount: 85, type: 'income', date: '2024-01-15', category: 'Services' },
      { id: 2, description: 'Product Purchase', amount: -45, type: 'expense', date: '2024-01-14', category: 'Inventory' },
      { id: 3, description: 'Color Treatment', amount: 150, type: 'income', date: '2024-01-14', category: 'Services' },
    ],
    monthlyData: [
      { month: 'Jan', revenue: 4200, expenses: 1800, profit: 2400 },
      { month: 'Feb', revenue: 3800, expenses: 1600, profit: 2200 },
      { month: 'Mar', revenue: 4500, expenses: 1900, profit: 2600 },
      { month: 'Apr', revenue: 5200, expenses: 2100, profit: 3100 },
      { month: 'May', revenue: 4800, expenses: 1950, profit: 2850 },
      { month: 'Jun', revenue: 5500, expenses: 2200, profit: 3300 },
    ],
    categoryData: [
      { name: 'Services', value: 65, color: '#8b5cf6' },
      { name: 'Products', value: 25, color: '#3b82f6' },
      { name: 'Memberships', value: 10, color: '#06b6d4' },
    ]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your salon's financial performance</p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
            Live Data
          </Badge>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeData.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{financeData.monthlyChange}%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeData.totalExpenses)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600 font-medium">-2.3%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeData.netProfit)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+18.7%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900">59.5%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+5.2%</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financeData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444' }} />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <PieChart className="w-5 h-5 text-blue-600" />
                Revenue by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={financeData.categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {financeData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financeData.transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
