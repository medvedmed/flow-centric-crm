import React, { useState } from "react";
import { Calendar, Clock, Plus, Search, Filter, Users, Bell, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EnhancedScheduler from "@/components/EnhancedScheduler";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { useToast } from "@/hooks/use-toast";
import { permissionAwareScheduleApi } from "@/services/permissionAwareScheduleApi";
import { usePermissions } from "@/hooks/usePermissions";
import { ViewProtected, CreateProtected } from "@/components/ProtectedComponent";

// Interfaces
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

// Mock staff data - in a real app, this would come from the API too
const mockStaff: Staff[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b494?w=400&h=400&fit=crop&crop=face",
    specialties: ["Hair Styling", "Coloring"],
    workingHours: { start: "09:00", end: "17:00" },
    efficiency: 95,
    rating: 4.8
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002", 
    name: "Michael Chen",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    specialties: ["Massage", "Facial"],
    workingHours: { start: "10:00", end: "18:00" },
    efficiency: 92,
    rating: 4.9
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
  const { toast } = useToast();
  const { hasPermissionSync } = usePermissions();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBooking, setNewBooking] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    duration: 60,
    price: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBookSlot = (slot: BookingSlot) => {
    setSelectedSlot(slot);
    setIsBookingOpen(true);
  };

  const handleCreateBooking = async () => {
    if (!selectedSlot || !newBooking.clientName || !newBooking.service) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const endTime = new Date(`2000-01-01 ${selectedSlot.time}`);
      endTime.setMinutes(endTime.getMinutes() + newBooking.duration);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      const result = await permissionAwareScheduleApi.createAppointmentWithValidation({
        clientId: '', // Will be handled by the API
        staffId: selectedSlot.staffId,
        clientName: newBooking.clientName,
        clientPhone: newBooking.clientPhone,
        service: newBooking.service,
        startTime: selectedSlot.time,
        endTime: endTimeString,
        date: selectedDate,
        status: 'Scheduled',
        notes: '',
        price: newBooking.price,
        duration: newBooking.duration
      });

      if (result.success) {
        toast({
          title: "Appointment Created",
          description: `Appointment booked for ${newBooking.clientName} with ${selectedSlot.staffName}`,
        });

        setIsBookingOpen(false);
        setSelectedSlot(null);
        setNewBooking({
          clientName: "",
          clientPhone: "",
          service: "",
          duration: 60,
          price: 0
        });
        
        // Trigger refresh
        handleAppointmentUpdate();
      } else {
        toast({
          title: "Booking Failed",
          description: result.error || "Failed to create appointment",
          variant: "destructive",
        });
        
        if (result.conflicts) {
          console.log('Booking conflicts:', result.conflicts);
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentUpdate = () => {
    // This will trigger the scheduler to reload its data
    console.log('Refreshing appointment data...');
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
    <ViewProtected area="appointments">
      <div className={`space-y-6 ${isRTL ? 'font-arabic' : ''}`}>
        {/* Header */}
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
            <CreateProtected area="appointments">
              <Button className="bg-fresha-purple hover:bg-fresha-purple-dark">
                <Plus className="w-4 h-4 mr-2" />
                {t('new_appointment')}
              </Button>
            </CreateProtected>
          </div>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-4">
          <Label htmlFor="date-picker" className={isRTL ? 'font-arabic' : ''}>
            {t('select_date')}:
          </Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-purple-100 hover:border-purple-200 transition-colors duration-200">
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {t('today_appointments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fresha-purple">
                {appointments.length}
              </div>
              <p className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                +2 {t('from_yesterday')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100 hover:border-purple-200 transition-colors duration-200">
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {t('revenue_today')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fresha-success">
                $1,240
              </div>
              <p className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                +15% {t('from_yesterday')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100 hover:border-purple-200 transition-colors duration-200">
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
                {t('cancellations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fresha-error">
                2
              </div>
              <p className={`text-xs text-gray-500 ${isRTL ? 'font-arabic' : ''}`}>
                -1 {t('from_yesterday')}
              </p>
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

        {/* Enhanced Scheduler */}
        <div className="space-y-4">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className={`text-xl font-semibold text-gray-900 ${isRTL ? 'font-arabic' : ''}`}>
              {t('schedule_overview')}
            </h2>
            <div className={`text-sm text-gray-600 ${isRTL ? 'text-left font-arabic' : 'text-right'}`}>
              {t('click_to_book')}
            </div>
          </div>
          
          <EnhancedScheduler
            date={selectedDate}
            onBookSlot={handleBookSlot}
            onAppointmentUpdate={handleAppointmentUpdate}
          />
        </div>

        {/* Booking Dialog */}
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
                  <p className={`text-sm text-gray-600 ${isRTL ? 'text-right font-arabic' : ''}`}>
                    {t('date')}: {selectedDate}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service" className={isRTL ? 'text-right font-arabic' : ''}>
                  {t('service')} *
                </Label>
                <Select onValueChange={handleServiceChange} disabled={loading}>
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
                  disabled={loading}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleCreateBooking} 
                  className="flex-1 bg-fresha-purple hover:bg-fresha-purple-dark"
                  disabled={loading || !newBooking.clientName || !newBooking.service}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {t('book')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ViewProtected>
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
