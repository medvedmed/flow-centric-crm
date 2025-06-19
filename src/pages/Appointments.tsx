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
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

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

const AppointmentsContent = () => {
  const { t, isRTL } = useLanguage();
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
    <div className={`space-y-6 ${isRTL ? 'font-arabic' : ''}`}>
      {/* Fresha-style Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('appointments')}</h1>
          <p className="text-gray-600">{t('manage_schedule')}</p>
        </div>
        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <LanguageToggle />
          <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
            <Filter className="w-4 h-4 mr-2" />
            {t('filter')}
          </Button>
          <Button className="bg-fresha-purple hover:bg-fresha-purple-dark">
            <Plus className="w-4 h-4 mr-2" />
            {t('new_appointment')}
          </Button>
        </div>
      </div>

      {/* Fresha-style Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-100 hover:border-purple-200 transition-colors duration-200">
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {t('today_appointments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fresha-purple">12</div>
            <p className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>+2 {t('from_yesterday')}</p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-100 hover:border-purple-200 transition-colors duration-200">
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {t('revenue_today')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fresha-success">$1,245</div>
            <p className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>+15% {t('from_yesterday')}</p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-100 hover:border-purple-200 transition-colors duration-200">
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {t('cancellations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fresha-error">2</div>
            <p className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>-1 {t('from_yesterday')}</p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-100 hover:border-purple-200 transition-colors duration-200">
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
              {t('utilization')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <p className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>+5% {t('from_yesterday')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fresha-style Unified Scheduler */}
      <div className="space-y-4">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
            {t('schedule_overview')}
          </h2>
          <div className={`text-sm text-gray-600 ${isRTL ? 'text-left font-arabic' : 'text-right'}`}>
            {t('click_to_book')}
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

      {/* Fresha-style Quick Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right font-arabic' : ''}>
              {t('book_appointment')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSlot && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className={`text-sm font-medium ${isRTL ? 'text-right font-arabic' : ''}`}>
                  {t('staff')}: {selectedSlot.staffName}
                </p>
                <p className={`text-sm text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
                  {t('time')}: {selectedSlot.time}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="clientName" className={isRTL ? 'text-right font-arabic' : ''}>
                {t('client_name')} *
              </Label>
              <Input
                id="clientName"
                value={newBooking.clientName}
                onChange={(e) => setNewBooking(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder={t('client_name')}
                className={isRTL ? 'text-right font-arabic' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone" className={isRTL ? 'text-right font-arabic' : ''}>
                {t('phone_number')}
              </Label>
              <Input
                id="clientPhone"
                value={newBooking.clientPhone}
                onChange={(e) => setNewBooking(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder={t('phone_number')}
                className={isRTL ? 'text-right font-arabic' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service" className={isRTL ? 'text-right font-arabic' : ''}>
                {t('service')} *
              </Label>
              <Select onValueChange={handleServiceChange}>
                <SelectTrigger className={isRTL ? 'text-right font-arabic' : ''}>
                  <SelectValue placeholder={t('service')} />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map(service => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name} - {service.duration}{t('minutes')} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newBooking.service && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm border">
                <p className={isRTL ? 'text-right font-arabic' : ''}>
                  {t('duration')}: {newBooking.duration} {t('minutes')}
                </p>
                <p className={isRTL ? 'text-right font-arabic' : ''}>
                  {t('price')}: ${newBooking.price}
                </p>
              </div>
            )}

            <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button 
                variant="outline" 
                onClick={() => setIsBookingOpen(false)} 
                className="flex-1 hover:bg-gray-50"
              >
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleCreateBooking} 
                className="flex-1 bg-fresha-purple hover:bg-fresha-purple-dark"
              >
                {t('book')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Appointments = () => {
  return (
    <LanguageProvider>
      <AppointmentsContent />
    </LanguageProvider>
  );
};

export default Appointments;
