
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Staff } from '@/services/types';
import StaffAvailability from './StaffAvailability';
import StaffCalendarView from './StaffCalendarView';
import { Calendar, Clock, Users, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StaffScheduleManager = () => {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Fetch real staff data
  const { data: staff = [], isLoading, error } = useQuery({
    queryKey: ['staff-schedule-manager'],
    queryFn: async (): Promise<Staff[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('salon_id', user.id)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      
      return data?.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        specialties: member.specialties || [],
        workingHoursStart: member.working_hours_start,
        workingHoursEnd: member.working_hours_end,
        workingDays: member.working_days || [],
        breakStart: member.break_start,
        breakEnd: member.break_end,
        efficiency: member.efficiency || 100,
        rating: member.rating || 5.0,
        imageUrl: member.image_url,
        hourlyRate: member.hourly_rate || 0,
        commissionRate: member.commission_rate || 35,
        status: member.status as Staff['status'],
        notes: member.notes,
        hireDate: member.hire_date,
        salonId: member.salon_id,
        staffCode: member.staff_code,
        staffLoginId: member.staff_login_id,
        staffLoginPassword: member.staff_login_password,
        createdAt: member.created_at,
        updatedAt: member.updated_at
      })) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch real appointments for calendar
  const { data: appointments = [] } = useQuery({
    queryKey: ['staff-appointments'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', user.id)
        .gte('date', today)
        .order('date')
        .order('start_time');
      
      if (error) throw error;
      
      return data?.map(apt => ({
        id: apt.id,
        staffId: apt.staff_id,
        title: `${apt.service} - ${apt.client_name}`,
        start: `${apt.date}T${apt.start_time}`,
        end: `${apt.date}T${apt.end_time}`,
        type: 'appointment' as const,
        clientName: apt.client_name,
        service: apt.service
      })) || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const handleAddEvent = (newEvent: any) => {
    console.log('Adding new event:', newEvent);
    // This would integrate with appointment creation
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Staff Schedule Management
            </h1>
            <p className="text-muted-foreground mt-1">Loading staff data...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Staff Schedule Management
            </h1>
            <p className="text-muted-foreground mt-1">Error loading staff data</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load staff schedule data. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Staff Schedule Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage staff availability, time-off, and scheduling.</p>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {staff.length > 0 ? (
            <StaffCalendarView
              staff={staff.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email,
                imageUrl: s.imageUrl,
                specialties: s.specialties || []
              }))}
              events={appointments}
              onAddEvent={handleAddEvent}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Staff Members</h3>
                <p className="text-gray-500 text-center">
                  Add staff members to manage their schedules and availability.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Staff Availability Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium">Select Staff Member:</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Choose a staff member</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStaffId && (
                  <StaffAvailability
                    staffId={selectedStaffId}
                    staffName={staff.find(s => s.id === selectedStaffId)?.name || ''}
                  />
                )}

                {!selectedStaffId && staff.length > 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Please select a staff member to manage their availability.
                  </div>
                )}

                {staff.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No staff members found. Please add staff members first.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Staff Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Staff Members</span>
                    <span className="font-medium">{staff.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Today</span>
                    <span className="font-medium">{staff.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Appointments</span>
                    <span className="font-medium">{appointments.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    View Today's Schedule
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Staff Availability
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Schedule Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffScheduleManager;
