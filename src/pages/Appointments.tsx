import React, { useState } from "react";
import { Calendar, Clock, Plus, Search, Filter, Users, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import UnifiedScheduler from "@/components/UnifiedScheduler";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Interfaces
interface Appointment {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientPhone: string;
  service: string;
  price: number;
  status: string;
  duration: number;
}

interface Staff {
  id: string;
  name: string;
  image: string;
  specialties: string[];
  workingHours: { start: string; end: string };
  efficiency: number;
  rating: number;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
}

interface BookingSlot {
  staffId: string;
  time: string;
  staffName: string;
}

// Mock data
const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b494?w=400&h=400&fit=crop&crop=face",
    specialties: ["Hair Styling", "Coloring"],
    workingHours: { start: "09:00", end: "17:00" },
    efficiency: 95,
    rating: 4.8
  },
  {
    id: "2", 
    name: "Michael Chen",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    specialties: ["Massage", "Facial"],
    workingHours: { start: "10:00", end: "18:00" },
    efficiency: 92,
    rating: 4.9
  }
];

const mockAppointments: Appointment[] = [
  {
    id: "1",
    staffId: "1",
    startTime: "09:00",
    endTime: "10:30",
    clientName: "Alice Cooper",
    clientPhone: "+1 555-0101",
    service: "Haircut & Style",
    price: 85,
    status: "confirmed",
    duration: 90
  },
  {
    id: "2",
    staffId: "2",
    startTime: "10:00",
    endTime: "11:00",
    clientName: "Bob Smith",
    clientPhone: "+1 555-0102",
    service: "Massage",
    price: 120,
    status: "in-progress",
    duration: 60
  }
];

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
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
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [newBooking, setNewBooking] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    duration: 60,
    price: 0
  });
  const { toast } = useToast();

  const timeSlots = generateTimeSlots();

  const handleAppointmentMove = (appointmentId: string, newStaffId: string, newTime: string) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, staffId: newStaffId, startTime: newTime }
        : apt
    ));
    
    toast({
      title: "Appointment moved",
      description: "The appointment has been successfully rescheduled.",
    });
  };

  const handleBookSlot = (slot: BookingSlot) => {
    setSelectedSlot(slot);
    setIsBookingOpen(true);
  };

  const handleCreateBooking = () => {
    if (!selectedSlot || !newBooking.clientName || !newBooking.service) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const endTime = new Date(`2000-01-01 ${selectedSlot.time}`);
    endTime.setMinutes(endTime.getMinutes() + newBooking.duration);
    const endTimeString = endTime.toTimeString().slice(0, 5);

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      staffId: selectedSlot.staffId,
      startTime: selectedSlot.time,
      endTime: endTimeString,
      clientName: newBooking.clientName,
      clientPhone: newBooking.clientPhone,
      service: newBooking.service,
      price: newBooking.price,
      status: "confirmed",
      duration: newBooking.duration
    };

    setAppointments(prev => [...prev, newAppointment]);
    setIsBookingOpen(false);
    setSelectedSlot(null);
    setNewBooking({
      clientName: "",
      clientPhone: "",
      service: "",
      duration: 60,
      price: 0
    });

    toast({
      title: "Booking created",
      description: `Appointment booked for ${newBooking.clientName} with ${selectedSlot.staffName}`,
    });
  };

  const serviceOptions = [
    { name: "Haircut & Style", duration: 90, price: 85 },
    { name: "Hair Coloring", duration: 120, price: 150 },
    { name: "Manicure", duration: 60, price: 45 },
    { name: "Pedicure", duration: 75, price: 55 },
    { name: "Facial", duration: 90, price: 95 },
    { name: "Massage", duration: 60, price: 120 },
    { name: "Beard Trim", duration: 30, price: 35 },
    { name: "Eyebrow", duration: 45, price: 40 }
  ];

  const handleServiceChange = (serviceName: string) => {
    const service = serviceOptions.find(s => s.name === serviceName);
    if (service) {
      setNewBooking(prev => ({
        ...prev,
        service: serviceName,
        duration: service.duration,
        price: service.price
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your salon's booking schedule</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">12</div>
            <p className="text-xs text-gray-500">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">$1,245</div>
            <p className="text-xs text-gray-500">+15% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cancellations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
            <p className="text-xs text-gray-500">-1 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <p className="text-xs text-gray-500">+5% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      {/* Unified Scheduler */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Overview</h2>
          <div className="text-sm text-gray-600">
            Click on empty time slots to book appointments
          </div>
        </div>
        <UnifiedScheduler
          staff={mockStaff}
          appointments={appointments}
          timeSlots={timeSlots}
          onAppointmentMove={handleAppointmentMove}
          onBookSlot={handleBookSlot}
        />
      </div>

      {/* Quick Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSlot && (
              <div className="p-3 bg-teal-50 rounded-lg">
                <p className="text-sm font-medium">Staff: {selectedSlot.staffName}</p>
                <p className="text-sm text-gray-600">Time: {selectedSlot.time}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={newBooking.clientName}
                onChange={(e) => setNewBooking(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Enter client name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">Phone Number</Label>
              <Input
                id="clientPhone"
                value={newBooking.clientPhone}
                onChange={(e) => setNewBooking(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service *</Label>
              <Select onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map(service => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name} - {service.duration}min - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newBooking.service && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <p>Duration: {newBooking.duration} minutes</p>
                <p>Price: ${newBooking.price}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsBookingOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateBooking} className="flex-1">
                Book Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
