import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, TrendingUp, Clock, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { QuickPaymentSection } from '@/components/QuickPaymentSection';
import { StaffPerformanceDashboard } from '@/components/StaffPerformanceDashboard';
import { format, isToday, isTomorrow } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get today's appointments
      const { data: todayAppointments, error: todayError } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('date', today);

      if (todayError) throw todayError;

      // Get tomorrow's appointments
      const { data: tomorrowAppointments, error: tomorrowError } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('date', tomorrow);

      if (tomorrowError) throw tomorrowError;

      // Get this month's revenue
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const { data: monthlyRevenue, error: revenueError } = await supabase
        .from('appointments')
        .select('price')
        .eq('salon_id', user?.id)
        .eq('status', 'Completed')
        .gte('date', startOfMonth);

      if (revenueError) throw revenueError;

      // Get total clients
      const { count: totalClients, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', user?.id);

      if (clientsError) throw clientsError;

      // Get low stock items
      const { data: lowStockItems, error: stockError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('salon_id', user?.id)
        .eq('is_active', true);

      if (stockError) throw stockError;

      const lowStock = lowStockItems?.filter(item => 
        item.current_stock <= item.minimum_stock
      ) || [];

      return {
        todayAppointments: todayAppointments || [],
        tomorrowAppointments: tomorrowAppointments || [],
        monthlyRevenue: monthlyRevenue?.reduce((sum, apt) => sum + (apt.price || 0), 0) || 0,
        totalClients: totalClients || 0,
        lowStockCount: lowStock.length
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: upcomingAppointments = [] } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          staff!inner(name)
        `)
        .eq('salon_id', user?.id)
        .gte('date', today)
        .in('status', ['Scheduled', 'Confirmed'])
        .order('date')
        .order('start_time')
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening at your salon.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.todayAppointments.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.todayAppointments.filter(apt => apt.status === 'Completed').length || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow's Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.tomorrowAppointments.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for tomorrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardStats?.monthlyRevenue.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.lowStockCount ? `${dashboardStats.lowStockCount} low stock items` : 'Stock levels good'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Payment Section */}
        <QuickPaymentSection />

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming appointments
                </p>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{appointment.client_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.service} with {appointment.staff?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(appointment.date), 'MMM dd')} at {appointment.start_time}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={appointment.status === 'Confirmed' ? 'default' : 'secondary'}
                      >
                        {appointment.status}
                      </Badge>
                      <div className="text-sm font-medium mt-1">
                        ${appointment.price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Dashboard */}
      <StaffPerformanceDashboard />
    </div>
  );
};

export default Dashboard;
