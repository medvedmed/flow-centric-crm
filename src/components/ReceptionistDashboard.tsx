
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Phone, Plus, Clock, Loader2, RefreshCw } from "lucide-react";
import { useDashboardStats } from "@/hooks/dashboard/useDashboardData";
import { useNavigate } from "react-router-dom";
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ReceptionistDashboard = () => {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCallClient = (phone?: string) => {
    if (phone) {
      toast({
        title: "Calling Client",
        description: `Initiating call to ${phone}...`,
      });
      window.open(`tel:${phone}`, '_self');
    }
  };

  const handleViewSchedule = () => {
    toast({
      title: "Navigating",
      description: "Opening appointment scheduler...",
    });
    navigate('/appointments');
  };

  const handleViewClients = () => {
    toast({
      title: "Navigating",
      description: "Opening client directory...",
    });
    navigate('/clients');
  };

  const handleRefreshData = () => {
    toast({
      title: "Refreshing",
      description: "Updating dashboard data...",
    });
    refetch();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Front Desk
            </h1>
            <p className="text-muted-foreground mt-1">Manage appointments and walk-ins for today</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
            <Button variant="outline" size="sm" onClick={handleRefreshData} className="ml-2">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          <span className="text-gray-600">Loading front desk dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Front Desk
          </h1>
          <p className="text-muted-foreground mt-1">Manage appointments and walk-ins for today</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button variant="outline" onClick={handleViewClients}>
            <Phone className="w-4 h-4 mr-2" />
            View Clients
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{stats?.todayAppointments || 0}</div>
            <p className="text-xs text-teal-600">{stats?.waitingClients || 0} walk-ins available</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Waiting</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats?.waitingClients || 0}</div>
            <p className="text-xs text-orange-600">Average wait: 12 min</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats?.checkIns || 0}</div>
            <p className="text-xs text-green-600">On time today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">No Shows</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats?.noShows || 0}</div>
            <p className="text-xs text-purple-600">Below average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Next Appointments</CardTitle>
            <Button variant="outline" size="sm" onClick={handleViewSchedule}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                stats.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono font-semibold text-teal-700 min-w-[50px]">
                        {appointment.time}
                      </div>
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <p className="text-sm text-muted-foreground">{appointment.service} • {appointment.staff}</p>
                      </div>
                    </div>
                    {appointment.phone && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCallClient(appointment.phone)}
                        className="hover:bg-teal-100"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                  <Button variant="outline" size="sm" onClick={handleViewSchedule} className="mt-2">
                    View Schedule
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Waiting List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Waiting Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.waitingList && stats.waitingList.length > 0 ? (
                stats.waitingList.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-colors">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.service}</p>
                    </div>
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      {client.waitTime}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-muted-foreground">No clients waiting</p>
                  <AddAppointmentDialog
                    selectedDate={new Date()}
                    trigger={
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Walk-in
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleTimeString()} • Auto-refresh every 2 minutes
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
