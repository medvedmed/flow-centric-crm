import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Filter, Clock, Users, DollarSign, Search, Zap, Brain, Calendar as CalendarIcon, Settings2, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import DragDropScheduler from "@/components/DragDropScheduler";

// Enhanced color palette for different services and statuses
const serviceColors = {
  "Haircut & Style": { bg: "#10b981", text: "#ffffff" },
  "Hair Coloring": { bg: "#8b5cf6", text: "#ffffff" },
  "Manicure": { bg: "#f59e0b", text: "#ffffff" },
  "Pedicure": { bg: "#ef4444", text: "#ffffff" },
  "Facial": { bg: "#06b6d4", text: "#ffffff" },
  "Massage": { bg: "#ec4899", text: "#ffffff" },
  "Beard Trim": { bg: "#059669", text: "#ffffff" },
  "Eyebrow": { bg: "#7c3aed", text: "#ffffff" },
};

const statusColors = {
  "confirmed": { bg: "#10b981", text: "#ffffff" },
  "in-progress": { bg: "#3b82f6", text: "#ffffff" },
  "upcoming": { bg: "#f59e0b", text: "#ffffff" },
  "completed": { bg: "#6b7280", text: "#ffffff" },
  "cancelled": { bg: "#ef4444", text: "#ffffff" },
};

// Mock data for staff
const staffData = [
  {
    id: "staff-1",
    name: "Emma Wilson",
    image: "/placeholder.svg",
    specialties: ["Haircut", "Styling"],
    workingHours: { start: "09:00", end: "18:00" },
    efficiency: 95,
    rating: 4.9
  },
  {
    id: "staff-2", 
    name: "Sophia Davis",
    image: "/placeholder.svg",
    specialties: ["Coloring", "Highlights"],
    workingHours: { start: "10:00", end: "19:00" },
    efficiency: 92,
    rating: 4.8
  },
  {
    id: "staff-3",
    name: "Olivia Brown", 
    image: "/placeholder.svg",
    specialties: ["Manicure", "Pedicure"],
    workingHours: { start: "09:00", end: "17:00" },
    efficiency: 98,
    rating: 4.9
  },
  {
    id: "staff-4",
    name: "Isabella Miller",
    image: "/placeholder.svg", 
    specialties: ["Facial", "Massage"],
    workingHours: { start: "11:00", end: "20:00" },
    efficiency: 89,
    rating: 4.7
  }
];

// Mock appointments data
const initialAppointments = [
  {
    id: "apt-1",
    staffId: "staff-1",
    startTime: "10:00",
    endTime: "11:00",
    clientName: "Sarah Johnson",
    clientPhone: "+1 234 567 8901",
    service: "Haircut & Style",
    price: 85,
    status: "confirmed"
  },
  {
    id: "apt-2", 
    staffId: "staff-2",
    startTime: "11:30",
    endTime: "13:30", 
    clientName: "Michael Chen",
    clientPhone: "+1 234 567 8902",
    service: "Hair Coloring",
    price: 150,
    status: "in-progress"
  },
  {
    id: "apt-3",
    staffId: "staff-3", 
    startTime: "14:00",
    endTime: "14:45",
    clientName: "Emily Rodriguez", 
    clientPhone: "+1 234 567 8903",
    service: "Manicure",
    price: 40,
    status: "upcoming"
  }
];

// Generate time slots
const generateTimeSlots = (startHour = 9, endHour = 20, interval = 30) => {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour && minute > 0) break;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time: timeString,
        hour,
        minute
      });
    }
  }
  return slots;
};

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState(initialAppointments.map(apt => ({
    ...apt,
    duration: 60 // Add duration in minutes
  })));
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [workingHours, setWorkingHours] = useState({ start: 9, end: 20 });
  const [timeInterval, setTimeInterval] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");

  const timeSlots = generateTimeSlots(workingHours.start, workingHours.end, timeInterval);
  
  const filteredStaff = selectedStaff === "all" ? staffData : staffData.filter(s => s.id === selectedStaff);
  const todayAppointments = appointments.filter(apt => 
    selectedStaff === "all" || apt.staffId === selectedStaff
  );

  const dailyStats = {
    totalAppointments: todayAppointments.length,
    totalRevenue: todayAppointments.reduce((sum, apt) => sum + apt.price, 0),
    confirmedCount: todayAppointments.filter(apt => apt.status === 'confirmed').length,
    inProgressCount: todayAppointments.filter(apt => apt.status === 'in-progress').length,
    efficiency: Math.round(filteredStaff.reduce((sum, staff) => sum + staff.efficiency, 0) / filteredStaff.length)
  };

  const handleAppointmentMove = (appointmentId: string, newStaffId: string, newTime: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === appointmentId) {
        // Calculate new end time based on duration
        const [hours, minutes] = newTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(startDate.getTime() + apt.duration * 60000);
        const newEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        
        toast({
          title: "Appointment Moved",
          description: `${apt.clientName}'s appointment moved to ${newTime}`,
        });
        
        return {
          ...apt,
          staffId: newStaffId,
          startTime: newTime,
          endTime: newEndTime
        };
      }
      return apt;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* AURA Platform Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-8 rounded-xl mb-6 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-wider mb-2">
                AURA PLATFORM
              </h1>
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6" />
                <span className="text-xl font-medium">Smart Appointment Management</span>
              </div>
              <p className="text-emerald-100 mt-2">AI-Powered Professional Booking System</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{dailyStats.totalAppointments}</div>
              <div className="text-emerald-100">Today's Bookings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-6">
          {/* Smart Controls Panel */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                  <Brain className="w-6 h-6 text-teal-600" />
                  Smart Booking Controls
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    AI Filter
                  </Button>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Quick Book
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-center text-gray-800">
                          Schedule New Appointment
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input 
                            placeholder="Search for existing client or add new..." 
                            className="pl-10 h-12 border-2 border-teal-200 focus:border-teal-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700">Service Type</Label>
                            <Select>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="haircut">Haircut & Style</SelectItem>
                                <SelectItem value="coloring">Hair Coloring</SelectItem>
                                <SelectItem value="manicure">Manicure</SelectItem>
                                <SelectItem value="facial">Facial Treatment</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-gray-700">Staff Member</Label>
                            <Select>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Auto-assign best fit" />
                              </SelectTrigger>
                              <SelectContent>
                                {staffData.map(staff => (
                                  <SelectItem key={staff.id} value={staff.id}>
                                    {staff.name} - {staff.rating}⭐
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-gray-700">Date</Label>
                            <Input type="date" className="h-12" />
                          </div>
                          <div>
                            <Label className="text-gray-700">Start Time</Label>
                            <Input type="time" className="h-12" />
                          </div>
                          <div>
                            <Label className="text-gray-700">Duration</Label>
                            <Select>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Auto" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 min</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600">
                            <Zap className="w-4 h-4 mr-2" />
                            Smart Schedule
                          </Button>
                          <Button variant="outline" className="h-12" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-gray-700">Staff View</Label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff Members</SelectItem>
                      {staffData.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Working Hours</Label>
                  <div className="flex gap-2">
                    <Select value={workingHours.start.toString()} onValueChange={(v) => setWorkingHours(prev => ({...prev, start: parseInt(v)}))}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => i + 6).map(hour => (
                          <SelectItem key={hour} value={hour.toString()}>{hour}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={workingHours.end.toString()} onValueChange={(v) => setWorkingHours(prev => ({...prev, end: parseInt(v)}))}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 8}, (_, i) => i + 17).map(hour => (
                          <SelectItem key={hour} value={hour.toString()}>{hour}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700">Time Slots</Label>
                  <Select value={timeInterval.toString()} onValueChange={(v) => setTimeInterval(parseInt(v))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min intervals</SelectItem>
                      <SelectItem value="30">30 min intervals</SelectItem>
                      <SelectItem value="60">1 hour intervals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Quick Actions</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drag & Drop Scheduler */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <Clock className="w-6 h-6 text-teal-600" />
                Interactive Schedule - Drag & Drop to Adjust Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropScheduler
                staff={filteredStaff}
                appointments={appointments}
                timeSlots={timeSlots}
                onAppointmentMove={handleAppointmentMove}
              />
            </CardContent>
          </Card>

          {/* Staff Performance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStaff.map((staff) => (
              <Card key={staff.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={staff.image}
                      alt={staff.name}
                      className="w-12 h-12 rounded-full border-2 border-teal-200"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{staff.name}</h3>
                      <p className="text-sm text-gray-600">{staff.rating}⭐ Rating</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Efficiency</span>
                      <span className="font-semibold text-teal-600">{staff.efficiency}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Today's Schedule</div>
                      {appointments
                        .filter(apt => apt.staffId === staff.id)
                        .slice(0, 2)
                        .map(apt => {
                          const colors = serviceColors[apt.service as keyof typeof serviceColors] || statusColors[apt.status as keyof typeof statusColors];
                          return (
                            <div key={apt.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: colors?.bg + '20' }}>
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: colors?.bg }} />
                              <div className="flex-1">
                                <div className="text-xs font-medium">{apt.startTime} - {apt.clientName}</div>
                                <div className="text-xs text-gray-500">{apt.service}</div>
                              </div>
                              <div className="text-xs font-bold">${apt.price}</div>
                            </div>
                          );
                        })}
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      <Clock className="w-4 h-4 mr-2" />
                      View Full Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights Panel */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                AI Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{dailyStats.efficiency}%</div>
                  <div className="text-sm text-gray-600">Team Efficiency</div>
                  <div className="text-xs text-gray-500 mt-1">↗ +5% from yesterday</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">12 min</div>
                  <div className="text-sm text-gray-600">Avg Wait Time</div>
                  <div className="text-xs text-gray-500 mt-1">↘ -3 min from yesterday</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">96%</div>
                  <div className="text-sm text-gray-600">Client Satisfaction</div>
                  <div className="text-xs text-gray-500 mt-1">↗ +2% this week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Compact Calendar & Quick Stats */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">Appointments</span>
                </div>
                <span className="font-semibold text-xl">{dailyStats.totalAppointments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Revenue</span>
                </div>
                <span className="font-semibold text-xl">${dailyStats.totalRevenue}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-green-100 text-green-800">
                  {dailyStats.confirmedCount} Confirmed
                </Badge>
                <Badge className="bg-amber-100 text-amber-800">
                  {dailyStats.inProgressCount} Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Compact Calendar */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-teal-600" />
                Quick Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full scale-90"
              />
              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Add
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  View Day Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Service Legend */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Service Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(serviceColors).slice(0, 6).map(([service, colors]) => (
                <div key={service} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: colors.bg }}
                  />
                  <span className="text-xs">{service}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Zap className="w-4 h-4 mr-2" />
                AI Auto-Schedule
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Brain className="w-4 h-4 mr-2" />
                Smart Recommendations
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Search className="w-4 h-4 mr-2" />
                Find Availability
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
