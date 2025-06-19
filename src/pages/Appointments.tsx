
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Filter, ChevronLeft, ChevronRight, Users, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Enhanced color palette for different services and statuses
const serviceColors = {
  "Haircut & Style": { bg: "#10b981", text: "#ffffff" }, // Green
  "Hair Coloring": { bg: "#8b5cf6", text: "#ffffff" }, // Purple
  "Manicure": { bg: "#f59e0b", text: "#ffffff" }, // Amber
  "Pedicure": { bg: "#ef4444", text: "#ffffff" }, // Red
  "Facial": { bg: "#06b6d4", text: "#ffffff" }, // Cyan
  "Massage": { bg: "#ec4899", text: "#ffffff" }, // Pink
  "Beard Trim": { bg: "#059669", text: "#ffffff" }, // Emerald
  "Eyebrow": { bg: "#7c3aed", text: "#ffffff" }, // Violet
};

const statusColors = {
  "confirmed": { bg: "#10b981", text: "#ffffff" }, // Green
  "in-progress": { bg: "#3b82f6", text: "#ffffff" }, // Blue
  "upcoming": { bg: "#f59e0b", text: "#ffffff" }, // Amber
  "completed": { bg: "#6b7280", text: "#ffffff" }, // Gray
  "cancelled": { bg: "#ef4444", text: "#ffffff" }, // Red
};

// Mock data for staff
const staffData = [
  {
    id: "staff-1",
    name: "Emma Wilson",
    image: "/placeholder.svg",
    specialties: ["Haircut", "Styling"],
    workingHours: { start: "09:00", end: "18:00" }
  },
  {
    id: "staff-2", 
    name: "Sophia Davis",
    image: "/placeholder.svg",
    specialties: ["Coloring", "Highlights"],
    workingHours: { start: "10:00", end: "19:00" }
  },
  {
    id: "staff-3",
    name: "Olivia Brown", 
    image: "/placeholder.svg",
    specialties: ["Manicure", "Pedicure"],
    workingHours: { start: "09:00", end: "17:00" }
  },
  {
    id: "staff-4",
    name: "Isabella Miller",
    image: "/placeholder.svg", 
    specialties: ["Facial", "Massage"],
    workingHours: { start: "11:00", end: "20:00" }
  }
];

// Mock appointments data with enhanced color system
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
  },
  {
    id: "apt-4",
    staffId: "staff-1",
    startTime: "15:30", 
    endTime: "16:30",
    clientName: "David Wilson",
    clientPhone: "+1 234 567 8904", 
    service: "Beard Trim",
    price: 35,
    status: "confirmed"
  },
  {
    id: "apt-5",
    staffId: "staff-4",
    startTime: "16:00", 
    endTime: "17:00",
    clientName: "Lisa Parker",
    clientPhone: "+1 234 567 8905", 
    service: "Facial",
    price: 75,
    status: "upcoming"
  },
  {
    id: "apt-6",
    staffId: "staff-3",
    startTime: "10:30", 
    endTime: "11:15",
    clientName: "Anna Smith",
    clientPhone: "+1 234 567 8906", 
    service: "Pedicure",
    price: 50,
    status: "confirmed"
  }
];

// Generate time slots from 9 AM to 8 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Calculate appointment position and height based on time
const calculateAppointmentStyle = (startTime: string, endTime: string) => {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  const slotHeight = 60; // Each 30-min slot is 60px
  const startSlotIndex = timeSlots.findIndex(slot => parseTimeToMinutes(slot) <= startMinutes);
  const duration = endMinutes - startMinutes;
  
  return {
    top: `${startSlotIndex * 30}px`, // 30px per half hour
    height: `${(duration / 30) * 30}px`,
    position: 'absolute' as const,
    width: 'calc(100% - 8px)',
    left: '4px',
    zIndex: 10
  };
};

const parseTimeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Get appointment colors based on service and status
const getAppointmentColors = (service: string, status: string) => {
  const serviceColor = serviceColors[service as keyof typeof serviceColors];
  const statusColor = statusColors[status as keyof typeof statusColors];
  
  // Prioritize service color, fallback to status color
  return serviceColor || statusColor || { bg: "#6b7280", text: "#ffffff" };
};

// Enhanced Draggable Appointment Component with DIKIDI-style colors
const DraggableAppointment = ({ appointment }: { appointment: any }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id });

  const baseStyle = calculateAppointmentStyle(appointment.startTime, appointment.endTime);
  const colors = getAppointmentColors(appointment.service, appointment.status);
  
  const style = {
    ...baseStyle,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    backgroundColor: colors.bg,
    color: colors.text,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg shadow-lg border-0 p-3 cursor-move hover:shadow-xl transition-all duration-200 hover:scale-105"
    >
      <div className="text-xs font-bold truncate mb-1">
        {appointment.startTime} - {appointment.endTime}
      </div>
      <div className="text-sm font-semibold truncate mb-1">
        {appointment.clientName}
      </div>
      <div className="text-xs opacity-90 truncate mb-1">
        {appointment.service}
      </div>
      <div className="text-xs font-bold">
        ${appointment.price}
      </div>
      <div className="absolute top-1 right-2">
        <div className={`w-2 h-2 rounded-full ${
          appointment.status === 'confirmed' ? 'bg-white' :
          appointment.status === 'in-progress' ? 'bg-yellow-300' :
          appointment.status === 'upcoming' ? 'bg-orange-300' :
          'bg-gray-300'
        }`} />
      </div>
    </div>
  );
};

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over) return;

    // Handle dropping appointment on a different staff column
    if (over.id.includes('staff-')) {
      const appointmentId = active.id;
      const newStaffId = over.id;
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, staffId: newStaffId }
            : apt
        )
      );
      
      toast({
        title: "Appointment Moved",
        description: "Appointment has been reassigned successfully.",
      });
    }

    setActiveId(null);
  };

  const filteredStaff = selectedStaff === "all" ? staffData : staffData.filter(s => s.id === selectedStaff);
  const todayAppointments = appointments.filter(apt => 
    selectedStaff === "all" || apt.staffId === selectedStaff
  );

  const dailyStats = {
    totalAppointments: todayAppointments.length,
    totalRevenue: todayAppointments.reduce((sum, apt) => sum + apt.price, 0),
    confirmedCount: todayAppointments.filter(apt => apt.status === 'confirmed').length,
    inProgressCount: todayAppointments.filter(apt => apt.status === 'in-progress').length
  };

  return (
    <div className="space-y-6 h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Appointment Calendar
          </h1>
          <p className="text-muted-foreground mt-1">Drag and drop to reschedule appointments</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffData.map(staff => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Client Name</Label>
                  <Input placeholder="Enter client name" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input placeholder="Enter phone number" />
                </div>
                <div>
                  <Label>Service</Label>
                  <Select>
                    <SelectTrigger>
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
                  <Label>Staff Member</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffData.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input type="time" />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Schedule</Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Calendar Layout - Centerpiece as requested */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
        {/* Calendar and Stats Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Date Navigation */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-semibold">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Daily Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span className="text-sm">Appointments</span>
                </div>
                <span className="font-semibold">{dailyStats.totalAppointments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Revenue</span>
                </div>
                <span className="font-semibold">${dailyStats.totalRevenue}</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {dailyStats.confirmedCount} Confirmed
                </Badge>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {dailyStats.inProgressCount} Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Color Legend */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
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
        </div>

        {/* MAIN DRAG & DROP BOOKING CALENDAR - The Centerpiece */}
        <div className="lg:col-span-4 overflow-hidden">
          <Card className="border-0 shadow-xl h-full">
            <CardContent className="p-0 h-full">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-full">
                  {filteredStaff.map((staff) => (
                    <div key={staff.id} className="border-r border-gray-200 last:border-r-0">
                      {/* Staff Header */}
                      <div className="p-4 border-b bg-gradient-to-r from-teal-50 to-cyan-50 sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                          <img
                            src={staff.image}
                            alt={staff.name}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          />
                          <div>
                            <h3 className="font-semibold text-sm">{staff.name}</h3>
                            <p className="text-xs text-gray-600">
                              {staff.workingHours.start} - {staff.workingHours.end}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Time Grid */}
                      <div className="relative bg-gray-50" style={{ height: '660px' }}>
                        {/* Time slots background with enhanced grid */}
                        {timeSlots.map((time, index) => (
                          <div
                            key={time}
                            className={`absolute w-full border-b ${
                              index % 2 === 0 ? 'border-gray-300' : 'border-gray-200'
                            } hover:bg-gray-100 transition-colors`}
                            style={{
                              top: `${index * 30}px`,
                              height: '30px'
                            }}
                          >
                            {index % 2 === 0 && (
                              <span className="absolute left-2 top-1 text-xs text-gray-500 font-medium">
                                {time}
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Drop zone for staff */}
                        <div
                          id={staff.id}
                          className="absolute inset-0 z-0"
                          style={{ minHeight: '660px' }}
                        />

                        {/* Appointments */}
                        <SortableContext
                          items={appointments.filter(apt => apt.staffId === staff.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {appointments
                            .filter(apt => apt.staffId === staff.id)
                            .map(appointment => (
                              <DraggableAppointment
                                key={appointment.id}
                                appointment={appointment}
                              />
                            ))}
                        </SortableContext>
                      </div>
                    </div>
                  ))}
                </div>

                <DragOverlay>
                  {activeId ? (
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg shadow-2xl border-0 p-3 transform rotate-3">
                      <div className="text-xs font-bold">Moving appointment...</div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
