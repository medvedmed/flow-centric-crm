
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Phone, Plus, Clock } from "lucide-react";

const upcomingAppointments = [
  { id: 1, time: '09:00', client: 'Sarah Johnson', staff: 'Emma', service: 'Haircut', phone: '+1234567890' },
  { id: 2, time: '09:30', client: 'Walk-in', staff: 'Available', service: 'Quick Service', phone: null },
  { id: 3, time: '10:00', client: 'Michael Chen', staff: 'Sophia', service: 'Coloring', phone: '+1234567891' },
  { id: 4, time: '10:30', client: 'Emily Rodriguez', staff: 'Olivia', service: 'Manicure', phone: '+1234567892' },
];

const waitingClients = [
  { name: 'Lisa Brown', service: 'Walk-in Cut', waitTime: '15 min' },
  { name: 'James Wilson', service: 'Quick Trim', waitTime: '8 min' },
];

const ReceptionistDashboard = () => {
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
          <Button variant="outline">
            <Phone className="w-4 h-4 mr-2" />
            Call Client
          </Button>
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
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
            <div className="text-2xl font-bold text-teal-900">18</div>
            <p className="text-xs text-teal-600">2 walk-ins available</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Waiting</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">2</div>
            <p className="text-xs text-orange-600">Average wait: 12 min</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">6</div>
            <p className="text-xs text-green-600">On time today</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">No Shows</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">1</div>
            <p className="text-xs text-purple-600">Below average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointments */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Next Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50">
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
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
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
              {waitingClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.service}</p>
                  </div>
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    {client.waitTime}
                  </Badge>
                </div>
              ))}
              {waitingClients.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No clients waiting</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
