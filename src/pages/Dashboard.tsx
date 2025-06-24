
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, DollarSign, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabaseApi } from '@/services/supabaseApi';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarToggle } from '@/components/SidebarToggle';
import { QuickPaymentInterface } from '@/components/QuickPaymentInterface';
import { ProductQuickSale } from '@/components/ProductQuickSale';
import { MiniCalendar } from '@/components/MiniCalendar';
import { StaffOverview } from '@/components/StaffOverview';
import { ReceptionistDashboard } from '@/components/ReceptionistDashboard';
import { StaffDashboard } from '@/components/StaffDashboard';
import { RoleBasedWelcome } from '@/components/RoleBasedWelcome';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useRoleBasedUI } from '@/hooks/useRoleBasedUI';
import { Navigate } from 'react-router-dom';
import { productSalesApi } from '@/services/api/productSalesApi';

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentRole, isLoading: roleLoading } = useRoleBasedUI();
  const { stats, isLoading: statsLoading } = useDashboardData();

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Product sales stats query
  const { data: todayProductStats } = useQuery({
    queryKey: ['product-sales', 'stats', 'today'],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0];
      return productSalesApi.getSalesStats(today, today);
    },
    enabled: isAuthenticated
  });

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Role-specific dashboard views
  if (currentRole === 'receptionist') {
    return <ReceptionistDashboard />;
  }

  if (currentRole === 'staff') {
    return <StaffDashboard />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      <AppSidebar />
      <SidebarToggle />
      
      <div className="flex-1 lg:ml-0 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <RoleBasedWelcome />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${((stats?.todayRevenue || 0) + (todayProductStats?.totalRevenue || 0)).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Services: ${stats?.todayRevenue?.toFixed(2) || '0.00'} • 
                  Products: ${todayProductStats?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled for today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Product Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayProductStats?.totalSales || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Items sold today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active clients
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Calendar and Staff */}
            <div className="space-y-6">
              <MiniCalendar />
              <StaffOverview />
            </div>

            {/* Middle Column - Quick Payment */}
            <div className="space-y-6">
              <QuickPaymentInterface />
            </div>

            {/* Right Column - Product Sales */}
            <div className="space-y-6">
              <ProductQuickSale />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
