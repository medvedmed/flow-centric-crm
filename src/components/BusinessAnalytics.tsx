
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  date: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  dailyRevenue: number;
  newClients: number;
  returningClients: number;
}

interface SummaryStats {
  totalRevenue: number;
  totalAppointments: number;
  completionRate: number;
  averageRevenuePerAppointment: number;
  clientRetentionRate: number;
  growthRate: number;
}

export const BusinessAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalRevenue: 0,
    totalAppointments: 0,
    completionRate: 0,
    averageRevenuePerAppointment: 0,
    clientRetentionRate: 0,
    growthRate: 0
  });
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const { data, error } = await supabase
        .from('business_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        date: item.date,
        totalAppointments: item.total_appointments,
        completedAppointments: item.completed_appointments,
        cancelledAppointments: item.cancelled_appointments,
        noShowAppointments: item.no_show_appointments,
        dailyRevenue: Number(item.daily_revenue),
        newClients: item.new_clients,
        returningClients: item.returning_clients
      })) || [];

      setAnalyticsData(formattedData);
      calculateSummaryStats(formattedData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryStats = (data: AnalyticsData[]) => {
    const totalRevenue = data.reduce((sum, day) => sum + day.dailyRevenue, 0);
    const totalAppointments = data.reduce((sum, day) => sum + day.totalAppointments, 0);
    const completedAppointments = data.reduce((sum, day) => sum + day.completedAppointments, 0);
    const totalNewClients = data.reduce((sum, day) => sum + day.newClients, 0);
    const totalReturningClients = data.reduce((sum, day) => sum + day.returningClients, 0);

    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;
    const averageRevenuePerAppointment = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;
    const clientRetentionRate = (totalNewClients + totalReturningClients) > 0 ? 
      (totalReturningClients / (totalNewClients + totalReturningClients)) * 100 : 0;

    // Calculate growth rate (compare first and last week)
    const firstWeekRevenue = data.slice(0, 7).reduce((sum, day) => sum + day.dailyRevenue, 0);
    const lastWeekRevenue = data.slice(-7).reduce((sum, day) => sum + day.dailyRevenue, 0);
    const growthRate = firstWeekRevenue > 0 ? ((lastWeekRevenue - firstWeekRevenue) / firstWeekRevenue) * 100 : 0;

    setSummaryStats({
      totalRevenue,
      totalAppointments,
      completionRate,
      averageRevenuePerAppointment,
      clientRetentionRate,
      growthRate
    });
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Total Appointments', 'Completed', 'Cancelled', 'No Show', 'Revenue', 'New Clients', 'Returning Clients'],
      ...analyticsData.map(row => [
        row.date,
        row.totalAppointments,
        row.completedAppointments,
        row.cancelledAppointments,
        row.noShowAppointments,
        row.dailyRevenue,
        row.newClients,
        row.returningClients
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salon_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const appointmentStatusData = analyticsData.length > 0 ? [
    { name: 'Completed', value: analyticsData.reduce((sum, day) => sum + day.completedAppointments, 0), color: '#22c55e' },
    { name: 'Cancelled', value: analyticsData.reduce((sum, day) => sum + day.cancelledAppointments, 0), color: '#ef4444' },
    { name: 'No Show', value: analyticsData.reduce((sum, day) => sum + day.noShowAppointments, 0), color: '#f59e0b' }
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Business Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your salon's performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${summaryStats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              {summaryStats.growthRate >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${summaryStats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(summaryStats.growthRate).toFixed(1)}% from last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold">{summaryStats.totalAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">
                {summaryStats.completionRate.toFixed(1)}% completion rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue/Appointment</p>
                <p className="text-2xl font-bold">${summaryStats.averageRevenuePerAppointment.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Client Retention</p>
                <p className="text-2xl font-bold">{summaryStats.clientRetentionRate.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="dailyRevenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Appointments Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completedAppointments" fill="#22c55e" name="Completed" />
              <Bar dataKey="cancelledAppointments" fill="#ef4444" name="Cancelled" />
              <Bar dataKey="noShowAppointments" fill="#f59e0b" name="No Show" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Appointment Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newClients" fill="#8b5cf6" name="New Clients" />
                <Bar dataKey="returningClients" fill="#06b6d4" name="Returning Clients" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
