
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";

const todayAppointments = [
  { id: 1, time: '09:00', client: 'Sarah Johnson', service: 'Haircut & Style', status: 'confirmed' },
  { id: 2, time: '10:30', client: 'Michael Chen', service: 'Hair Coloring', status: 'in-progress' },
  { id: 3, time: '11:45', client: 'Emily Rodriguez', service: 'Manicure', status: 'upcoming' },
  { id: 4, time: '14:00', client: 'David Wilson', service: 'Facial Treatment', status: 'upcoming' },
];

const StaffDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            My Schedule
          </h1>
          <p className="text-muted-foreground mt-1">Your appointments and schedule for today</p>
        </div>
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
          <Clock className="w-4 h-4 mr-2" />
          Clock In/Out
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">4</div>
            <p className="text-xs text-teal-600">Next: 09:00 AM</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700">Clients Served</CardTitle>
            <Users className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">1</div>
            <p className="text-xs text-cyan-600">3 remaining</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">25%</div>
            <p className="text-xs text-green-600">On track</p>
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
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
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

export default StaffDashboard;
