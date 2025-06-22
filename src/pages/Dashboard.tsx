import { usePermissions } from "@/hooks/usePermissions";
import StaffDashboard from "@/components/StaffDashboard";
import ReceptionistDashboard from "@/components/ReceptionistDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, Clock, Plus, ArrowUp, ArrowDown, DollarSign, Shield } from "lucide-react";
import { Navigate } from "react-router-dom";

const salesData = [
  { month: 'Jan', revenue: 45000, appointments: 120 },
  { month: 'Feb', revenue: 52000, appointments: 140 },
  { month: 'Mar', revenue: 48000, appointments: 110 },
  { month: 'Apr', revenue: 61000, appointments: 180 },
  { month: 'May', revenue: 55000, appointments: 160 },
  { month: 'Jun', revenue: 67000, appointments: 200 },
];

const serviceData = [
  { name: 'Haircut', value: 35, color: '#14b8a6' },
  { name: 'Coloring', value: 25, color: '#06b6d4' },
  { name: 'Manicure', value: 20, color: '#8b5cf6' },
  { name: 'Facial', value: 15, color: '#f59e0b' },
  { name: 'Massage', value: 5, color: '#ef4444' },
];

const todayAppointments = [
  { id: 1, time: '09:00', client: 'Sarah Johnson', service: 'Haircut & Style', stylist: 'Emma', status: 'confirmed' },
  { id: 2, time: '10:30', client: 'Michael Chen', service: 'Hair Coloring', stylist: 'Sophia', status: 'in-progress' },
  { id: 3, time: '11:45', client: 'Emily Rodriguez', service: 'Manicure', stylist: 'Olivia', status: 'upcoming' },
  { id: 4, time: '14:00', client: 'David Wilson', service: 'Facial Treatment', stylist: 'Emma', status: 'upcoming' },
];

const Dashboard = () => {
  const { userRole, roleLoading } = usePermissions();

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Staff should not have access to dashboard - redirect to appointments
  if (userRole === 'staff') {
    return <Navigate to="/appointments" replace />;
  }

  if (userRole === 'receptionist') {
    return <ReceptionistDashboard />;
  }

  // Default to owner/manager dashboard (existing Dashboard component)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Salon Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening at your salon today.</p>
        </div>
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">18</div>
            <p className="text-xs text-teal-600 flex items-center mt-1">
              <ArrowUp className="w-3 h-3 mr-1" />
              +3 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">1,247</div>
            <p className="text-xs text-cyan-600 flex items-center mt-1">
              <ArrowUp className="w-3 h-3 mr-1" />
              +12% this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">$67,000</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUp className="w-3 h-3 mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Avg. Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">8 min</div>
            <p className="text-xs text-amber-600 flex items-center mt-1">
              <ArrowDown className="w-3 h-3 mr-1" />
              -2 min from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {serviceData.map((entry) => (
                <Badge key={entry.name} variant="secondary" className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name} ({entry.value}%)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-mono font-semibold text-teal-700 min-w-[50px]">
                    {appointment.time}
                  </div>
                  <div>
                    <p className="font-medium">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground">{appointment.service} with {appointment.stylist}</p>
                  </div>
                </div>
                <Badge 
                  variant={appointment.status === 'confirmed' ? 'default' : 
                          appointment.status === 'in-progress' ? 'secondary' : 'outline'}
                  className={appointment.status === 'in-progress' ? 'bg-amber-100 text-amber-800' : ''}
                >
                  {appointment.status.replace('-', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
