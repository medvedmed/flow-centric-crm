
import { usePermissions } from "@/hooks/usePermissions";
import StaffDashboard from "@/components/StaffDashboard";
import ReceptionistDashboard from "@/components/ReceptionistDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Plus, ArrowUp, ArrowDown, DollarSign, Loader2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/profile/useProfileHooks";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardData";
import { AddAppointmentDialog } from "@/components/AddAppointmentDialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const { userRole, roleLoading } = usePermissions();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = useDashboardStats();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (roleLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
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

  // Get salon name or fallback
  const salonName = profile?.salon_name;
  const dashboardTitle = salonName ? `${salonName} Dashboard` : 'Salon Dashboard';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatGrowthPercentage = (growth: number) => {
    const absGrowth = Math.abs(growth);
    return absGrowth.toFixed(1);
  };

  const handleNewAppointment = () => {
    toast({
      title: "Navigating",
      description: "Opening appointment scheduler...",
    });
    navigate('/appointments');
  };

  const handleAddClient = () => {
    toast({
      title: "Navigating",
      description: "Opening client management...",
    });
    navigate('/clients');
  };

  const handleViewSchedule = () => {
    toast({
      title: "Navigating",
      description: "Opening appointment schedule...",
    });
    navigate('/appointments');
  };

  const handleViewReports = () => {
    toast({
      title: "Navigating",
      description: "Opening reports dashboard...",
    });
    navigate('/reports');
  };

  const handleRefreshData = () => {
    toast({
      title: "Refreshing",
      description: "Updating dashboard data...",
    });
    refetch();
  };

  // Show error state if stats fail to load
  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              {dashboardTitle}
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening at your salon today.</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
            <Button variant="outline" size="sm" onClick={handleRefreshData} className="ml-2">
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Default to owner/manager dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            {dashboardTitle}
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening at your salon today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={statsLoading}>
            {statsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
          <AddAppointmentDialog
            selectedDate={new Date()}
            trigger={
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            }
          />
        </div>
      </div>

      {/* Key Metrics - 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-teal-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-teal-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-teal-900">{stats?.todayAppointments || 0}</div>
                <p className="text-xs text-teal-600 flex items-center mt-1">
                  {stats?.appointmentGrowth && stats.appointmentGrowth >= 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {stats?.appointmentGrowth 
                    ? `${formatGrowthPercentage(stats.appointmentGrowth)}% from yesterday`
                    : 'No change from yesterday'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-cyan-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-cyan-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-cyan-900">{stats?.totalClients || 0}</div>
                <p className="text-xs text-cyan-600 flex items-center mt-1">
                  {stats?.clientGrowth && stats.clientGrowth >= 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {stats?.clientGrowth 
                    ? `${formatGrowthPercentage(stats.clientGrowth)}% this month`
                    : 'No change this month'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-green-200 rounded w-24 mb-2"></div>
                <div className="h-3 bg-green-200 rounded w-28"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  {stats?.revenueGrowth && stats.revenueGrowth >= 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {stats?.revenueGrowth 
                    ? `${formatGrowthPercentage(stats.revenueGrowth)}% from last month`
                    : 'No change from last month'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-teal-50 hover:border-teal-300"
              onClick={handleNewAppointment}
            >
              <Plus className="w-6 h-6 text-teal-600" />
              <span>New Appointment</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-cyan-50 hover:border-cyan-300"
              onClick={handleAddClient}
            >
              <Users className="w-6 h-6 text-cyan-600" />
              <span>Add Client</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
              onClick={handleViewSchedule}
            >
              <Calendar className="w-6 h-6 text-blue-600" />
              <span>View Schedule</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
              onClick={handleViewReports}
            >
              <DollarSign className="w-6 h-6 text-green-600" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Status */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleTimeString()} • Auto-refresh every 2 minutes
      </div>
    </div>
  );
};

export default Dashboard;
