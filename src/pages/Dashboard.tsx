import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, TrendingUp, Clock, Star, RefreshCw, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { userRole } = usePermissions();

  // Fetch real dashboard data
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Get today's appointments
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id)
        .eq('date', today);

      // Get total clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('salon_id', user.id);

      // Get monthly revenue
      const { data: monthlyTransactions } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('salon_id', user.id)
        .eq('transaction_type', 'income')
        .gte('transaction_date', monthStart);

      // Get upcoming appointments for today - fix the foreign key relationship
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select(`
          id, client_name, service, start_time, staff_id,
          staff!staff_id(name)
        `)
        .eq('salon_id', user.id)
        .eq('date', today)
        .eq('status', 'Scheduled')
        .order('start_time');

      const monthlyRevenue = monthlyTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const completedToday = todayAppointments?.filter(a => a.status === 'Completed').length || 0;

      return {
        todayAppointments: todayAppointments?.length || 0,
        totalClients: clients?.length || 0,
        monthlyRevenue,
        checkIns: completedToday,
        upcomingAppointments: upcomingAppointments?.map(apt => ({
          client: apt.client_name,
          service: apt.service,
          time: apt.start_time,
          staff: apt.staff?.name || 'Unassigned'
        })) || []
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleLogout = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-violet-600" />
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Today\'s Appointments', 
      value: dashboardStats?.todayAppointments?.toString() || '0', 
      icon: Calendar, 
      color: 'bg-gradient-to-r from-violet-500 to-purple-600', 
      change: '+0%'
    },
    { 
      title: 'Total Clients', 
      value: dashboardStats?.totalClients?.toString() || '0', 
      icon: Users, 
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
      change: '+0%'
    },
    { 
      title: 'Monthly Revenue', 
      value: `$${dashboardStats?.monthlyRevenue?.toLocaleString() || '0'}`, 
      icon: DollarSign, 
      color: 'bg-gradient-to-r from-green-500 to-emerald-600', 
      change: '+0%'
    },
    { 
      title: 'Check-ins Today', 
      value: dashboardStats?.checkIns?.toString() || '0', 
      icon: TrendingUp, 
      color: 'bg-gradient-to-r from-orange-500 to-red-600', 
      change: '+0%'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-violet-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back, {user?.email?.split('@')[0] || 'Owner'}
              </h1>
              <p className="text-gray-600 mt-2">Here's what's happening at your salon today</p>
              {userRole && (
                <Badge className="mt-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                  {userRole.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600" />
                <span className="text-gray-600">{format(new Date(), 'PPP')}</span>
              </div>
              <AddAppointmentDialog 
                trigger={
                  <Button className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Plus className="w-4 h-4" />
                    New Appointment
                  </Button>
                }
              />
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
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
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300">
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
            </Card>
          ))}
        </div>

        {/* Real-time Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Upcoming Appointments */}
          <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-violet-600" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardStats?.upcomingAppointments?.length ? (
                dashboardStats.upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-violet-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.client}</p>
                        <p className="text-sm text-gray-600">
                          {appointment.service} • {appointment.time} • {appointment.staff}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                      Upcoming
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming appointments today</p>
                </div>
              )}
            </CardContent>
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
                <AddAppointmentDialog 
                  trigger={
                    <Button className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 w-full h-auto">
                      <Calendar className="w-5 h-5" />
                      Book New Appointment
                    </Button>
                  }
                />
                <Button className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Add New Client
                </Button>
                <Button className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Record Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
