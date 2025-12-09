import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, TrendingUp, Clock, Star, RefreshCw, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { AddClientDialog } from '@/components/AddClientDialog';
import { QuickPaymentDialog } from '@/components/QuickPaymentDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
const Dashboard = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    userRole
  } = usePermissions();

  // Fetch real dashboard data
  const {
    data: dashboardStats,
    isLoading
  } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      // Get today's appointments
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('*, services!appointments_service_id_fkey(name, price)')
        .eq('organization_id', user.id)
        .gte('start_time', startOfToday)
        .lte('start_time', endOfToday);

      // Get total clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', user.id);

      // Get monthly revenue
      const { data: monthlyTransactions } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('salon_id', user.id)
        .eq('transaction_type', 'income')
        .gte('transaction_date', monthStart.split('T')[0]);

      // Get upcoming appointments for today
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select(`
          id, start_time,
          clients!appointments_client_id_fkey(full_name),
          services!appointments_service_id_fkey(name),
          profiles!appointments_staff_id_fkey(full_name)
        `)
        .eq('organization_id', user.id)
        .gte('start_time', startOfToday)
        .lte('start_time', endOfToday)
        .eq('status', 'pending')
        .order('start_time');

      const monthlyRevenue = monthlyTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const completedToday = todayAppointments?.filter(a => a.status === 'Completed').length || 0;
      
      return {
        todayAppointments: todayAppointments?.length || 0,
        totalClients: clients?.length || 0,
        monthlyRevenue,
        checkIns: completedToday,
        upcomingAppointments: (upcomingAppointments || []).map(apt => ({
          client: apt.clients?.full_name || 'Unknown',
          service: apt.services?.name || 'Service',
          time: apt.start_time?.split('T')[1]?.slice(0, 5) || '',
          staff: apt.profiles?.full_name || 'Unassigned'
        }))
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  const handleLogout = async () => {
    await signOut();
  };
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>;
  }
  const stats = [{
    title: 'Today\'s Appointments',
    value: dashboardStats?.todayAppointments?.toString() || '0',
    icon: Calendar,
    color: 'bg-gradient-to-r from-violet-500 to-purple-600',
    change: '+0%'
  }, {
    title: 'Total Clients',
    value: dashboardStats?.totalClients?.toString() || '0',
    icon: Users,
    color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    change: '+0%'
  }, {
    title: 'Monthly Revenue',
    value: `$${dashboardStats?.monthlyRevenue?.toLocaleString() || '0'}`,
    icon: DollarSign,
    color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    change: '+0%'
  }, {
    title: 'Check-ins Today',
    value: dashboardStats?.checkIns?.toString() || '0',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-orange-500 to-red-600',
    change: '+0%'
  }];
  return <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-violet-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {user?.email?.split('@')[0] || 'Owner'}
              </h1>
              <p className="text-gray-600 mt-2">Here's what's happening at your salon today</p>
              {userRole && <Badge className="mt-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                  {userRole.replace('_', ' ').toUpperCase()}
                </Badge>}
            </div>
            <div className="flex items-center gap-4">
              
              <AddAppointmentDialog trigger={<Button className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Plus className="w-4 h-4" />
                    New Appointment
                  </Button>} />
              <Button variant="outline" onClick={handleLogout} className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => <Card key={index} className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Real-time Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Upcoming Appointments */}
          <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
            
            
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <AddAppointmentDialog trigger={<Button className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 w-full h-auto">
                      <Calendar className="w-5 h-5" />
                      Book New Appointment
                    </Button>} />
                <AddClientDialog trigger={<Button className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 w-full h-auto">
                      <Users className="w-5 h-5" />
                      Add New Client
                    </Button>} />
                <QuickPaymentDialog trigger={<Button className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 w-full h-auto">
                      <DollarSign className="w-5 h-5" />
                      Record Payment
                    </Button>} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Dashboard;