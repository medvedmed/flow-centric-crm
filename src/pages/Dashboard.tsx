import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, TrendingUp, Clock, Star, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { QuickPaymentSection } from '@/components/QuickPaymentSection';
import { StaffPerformanceDashboard } from '@/components/StaffPerformanceDashboard';
import { format, isToday, isTomorrow } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: dashboardStats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('Fetching dashboard stats...');
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      try {
        // Get today's appointments with all fields
        const { data: todayAppointments, error: todayError } = await supabase
          .from('appointments')
          .select('*, staff!appointments_staff_id_fkey(name)')
          .eq('salon_id', user?.id)
          .eq('date', today);

        if (todayError) {
          console.error('Today appointments error:', todayError);
          throw todayError;
        }

        // Get tomorrow's appointments
        const { data: tomorrowAppointments, error: tomorrowError } = await supabase
          .from('appointments')
          .select('*')
          .eq('salon_id', user?.id)
          .eq('date', tomorrow);

        if (tomorrowError) {
          console.error('Tomorrow appointments error:', tomorrowError);
          throw tomorrowError;
        }

        // Get this month's revenue from financial transactions (more accurate)
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const { data: monthlyTransactions, error: revenueError } = await supabase
          .from('financial_transactions')
          .select('amount')
          .eq('salon_id', user?.id)
          .eq('transaction_type', 'income')
          .gte('transaction_date', startOfMonth);

        if (revenueError) {
          console.error('Monthly revenue error:', revenueError);
        }

        // Get pending payments (unpaid completed appointments)
        const { data: pendingPayments, error: pendingError } = await supabase
          .from('appointments')
          .select('price, client_name, service, date')
          .eq('salon_id', user?.id)
          .eq('status', 'Completed')
          .eq('payment_status', 'unpaid');

        if (pendingError) {
          console.error('Pending payments error:', pendingError);
        }

        // Get total clients
        const { count: totalClients, error: clientsError } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('salon_id', user?.id);

        if (clientsError) {
          console.error('Clients count error:', clientsError);
        }

        // Fix the low stock query - fetch all items and filter in JavaScript
        let lowStockItems = [];
        try {
          const { data: inventoryItems, error: stockError } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('salon_id', user?.id)
            .eq('is_active', true);

          if (stockError) {
            console.error('Inventory error:', stockError);
          } else if (inventoryItems) {
            // Filter low stock items in JavaScript to avoid database type issues
            lowStockItems = inventoryItems.filter(item => {
              const currentStock = Number(item.current_stock);
              const minimumStock = Number(item.minimum_stock);
              return currentStock < minimumStock;
            });
            console.log('Low stock items found:', lowStockItems.length);
          }
        } catch (error) {
          console.error('Error fetching inventory items:', error);
          lowStockItems = []; // Fallback to empty array
        }

        // Calculate today's revenue from completed appointments
        const todayRevenue = todayAppointments
          ?.filter(apt => apt.status === 'Completed')
          ?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0;

        // Calculate monthly revenue
        const monthlyRevenue = monthlyTransactions?.reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0) || 0;

        // Calculate pending payments total
        const totalPendingPayments = pendingPayments?.reduce((sum, payment) => sum + (Number(payment.price) || 0), 0) || 0;

        console.log('Dashboard stats calculated:', {
          todayAppointments: todayAppointments?.length || 0,
          todayRevenue,
          monthlyRevenue,
          totalPendingPayments,
          lowStockCount: lowStockItems.length
        });

        return {
          todayAppointments: todayAppointments || [],
          tomorrowAppointments: tomorrowAppointments || [],
          todayRevenue,
          monthlyRevenue,
          pendingPayments: pendingPayments || [],
          totalPendingPayments,
          totalClients: totalClients || 0,
          lowStockCount: lowStockItems.length,
          lowStockItems: lowStockItems.slice(0, 3)
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        // Return fallback data instead of throwing
        return {
          todayAppointments: [],
          tomorrowAppointments: [],
          todayRevenue: 0,
          monthlyRevenue: 0,
          pendingPayments: [],
          totalPendingPayments: 0,
          totalClients: 0,
          lowStockCount: 0,
          lowStockItems: []
        };
      }
    },
    enabled: !!user,
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 1, // Reduce retry attempts to prevent error loops
    retryDelay: 1000,
  });

  // Get upcoming appointments for the sidebar
  const { data: upcomingAppointments = [] } = useQuery({
    queryKey: ['upcoming-appointments'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*, staff!appointments_staff_id_fkey(name)')
        .eq('salon_id', user?.id)
        .gte('date', today)
        .in('status', ['Scheduled', 'Confirmed'])
        .order('date')
        .order('start_time')
        .limit(5);

      if (error) {
        console.error('Upcoming appointments error:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Force refresh data when payment updates happen
  React.useEffect(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        console.log('Appointment updated, refreshing dashboard...');
        refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions' }, () => {
        console.log('Financial transaction updated, refreshing dashboard...');
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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
              ${dashboardStats?.monthlyRevenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${dashboardStats?.totalPendingPayments?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.pendingPayments?.length || 0} unpaid appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardStats?.lowStockCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Items need restocking
            </p>
            {dashboardStats?.lowStockItems && dashboardStats.lowStockItems.length > 0 && (
              <div className="mt-2 text-xs text-red-600">
                {dashboardStats.lowStockItems.map(item => item.name).join(', ')}
                {(dashboardStats.lowStockCount || 0) > 3 && ` +${dashboardStats.lowStockCount - 3} more`}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${dashboardStats?.todayRevenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed appointments
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
                  <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium">{appointment.client_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.service} with {appointment.staff?.name || 'Unassigned'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(appointment.date), 'MMM dd')} at {appointment.start_time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={appointment.status === 'Confirmed' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                        {appointment.payment_status === 'unpaid' && (
                          <Badge variant="destructive" className="text-xs">
                            Unpaid
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm font-medium">
                        ${Number(appointment.price || 0).toFixed(2)}
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
