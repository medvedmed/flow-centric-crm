
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, DollarSign, TrendingUp, Clock, Star, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardData';

const Dashboard = () => {
  const { user } = useAuth();
  const { userRole } = usePermissions();
  const { data: dashboardStats, isLoading } = useDashboardStats();

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
      change: dashboardStats?.appointmentGrowth ? `${dashboardStats.appointmentGrowth > 0 ? '+' : ''}${dashboardStats.appointmentGrowth.toFixed(1)}%` : '0%' 
    },
    { 
      title: 'Total Clients', 
      value: dashboardStats?.totalClients?.toString() || '0', 
      icon: Users, 
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
      change: dashboardStats?.clientGrowth ? `${dashboardStats.clientGrowth > 0 ? '+' : ''}${dashboardStats.clientGrowth.toFixed(1)}%` : '0%' 
    },
    { 
      title: 'Monthly Revenue', 
      value: `$${dashboardStats?.monthlyRevenue?.toLocaleString() || '0'}`, 
      icon: DollarSign, 
      color: 'bg-gradient-to-r from-green-500 to-emerald-600', 
      change: dashboardStats?.revenueGrowth ? `${dashboardStats.revenueGrowth > 0 ? '+' : ''}${dashboardStats.revenueGrowth.toFixed(1)}%` : '0%' 
    },
    { 
      title: 'Check-ins Today', 
      value: dashboardStats?.checkIns?.toString() || '0', 
      icon: TrendingUp, 
      color: 'bg-gradient-to-r from-orange-500 to-red-600', 
      change: '+100%' 
    },
  ];

  const recentActivity = [
    { type: 'appointment', client: 'Sarah Johnson', service: 'Hair Cut & Style', time: '2 hours ago', status: 'completed' },
    { type: 'payment', client: 'Mike Chen', amount: '$85', time: '3 hours ago', status: 'paid' },
    { type: 'booking', client: 'Emma Wilson', service: 'Manicure', time: '5 hours ago', status: 'confirmed' },
    { type: 'cancellation', client: 'John Doe', service: 'Massage', time: '1 day ago', status: 'cancelled' },
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
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-600" />
              <span className="text-gray-600">{new Date().toLocaleDateString()}</span>
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

          {/* Waiting List */}
          <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-600" />
                Waiting List ({dashboardStats?.waitingClients || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardStats?.waitingList?.length ? (
                dashboardStats.waitingList.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-violet-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.service}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {client.waitTime}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No clients waiting</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Book New Appointment
              </button>
              <button className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Add New Client
              </button>
              <button className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2">
                <DollarSign className="w-5 h-5" />
                Record Payment
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
