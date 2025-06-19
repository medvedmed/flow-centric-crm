
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Search, Filter, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const appointmentsData = [
  {
    id: 1,
    time: "09:00",
    client: "Sarah Johnson",
    service: "Haircut & Style",
    stylist: "Emma Wilson",
    duration: 60,
    price: 85,
    status: "confirmed"
  },
  {
    id: 2,
    time: "10:30",
    client: "Michael Chen",
    service: "Hair Coloring",
    stylist: "Sophia Davis",
    duration: 120,
    price: 150,
    status: "in-progress"
  },
  {
    id: 3,
    time: "11:45",
    client: "Emily Rodriguez",
    service: "Manicure",
    stylist: "Olivia Brown",
    duration: 45,
    price: 40,
    status: "upcoming"
  },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState(appointmentsData);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    client: "",
    service: "",
    stylist: "",
    time: "",
    date: new Date(),
    notes: ""
  });

  const handleAddAppointment = () => {
    if (!newAppointment.client || !newAppointment.service || !newAppointment.stylist || !newAppointment.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const appointment = {
      id: appointments.length + 1,
      time: newAppointment.time,
      client: newAppointment.client,
      service: newAppointment.service,
      stylist: newAppointment.stylist,
      duration: 60,
      price: 85,
      status: "confirmed"
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment({
      client: "",
      service: "",
      stylist: "",
      time: "",
      date: new Date(),
      notes: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Appointment scheduled successfully!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">Manage your salon's appointment schedule.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client Name *</Label>
                  <Input
                    id="client"
                    value={newAppointment.client}
                    onChange={(e) => setNewAppointment({...newAppointment, client: e.target.value})}
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <Label htmlFor="service">Service *</Label>
                  <Select value={newAppointment.service} onValueChange={(value) => setNewAppointment({...newAppointment, service: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haircut">Haircut & Style</SelectItem>
                      <SelectItem value="coloring">Hair Coloring</SelectItem>
                      <SelectItem value="manicure">Manicure</SelectItem>
                      <SelectItem value="facial">Facial Treatment</SelectItem>
                      <SelectItem value="massage">Massage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stylist">Stylist *</Label>
                  <Select value={newAppointment.stylist} onValueChange={(value) => setNewAppointment({...newAppointment, stylist: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stylist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                      <SelectItem value="Sophia Davis">Sophia Davis</SelectItem>
                      <SelectItem value="Olivia Brown">Olivia Brown</SelectItem>
                      <SelectItem value="Isabella Miller">Isabella Miller</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddAppointment} className="flex-1">
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Today's Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Confirmed</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">In Progress</CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {appointments.filter(a => a.status === 'in-progress').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Schedule View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-mono font-semibold text-teal-700 min-w-[60px]">
                      {appointment.time}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.service} with {appointment.stylist}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.duration} min • ${appointment.price}
                      </p>
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
    </div>
  );
};

export default Appointments;
