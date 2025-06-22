
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStaff } from '@/hooks/useCrmData';
import StaffAvailability from './StaffAvailability';
import StaffCalendarView from './StaffCalendarView';
import { Calendar, Clock, Users, Settings } from 'lucide-react';

// Mock data for calendar events
const mockEvents = [
  {
    id: '1',
    staffId: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Haircut - John Doe',
    start: '2024-01-15T10:00:00',
    end: '2024-01-15T11:00:00',
    type: 'appointment' as const,
    clientName: 'John Doe',
    service: 'Haircut'
  },
  {
    id: '2',
    staffId: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Lunch Break',
    start: '2024-01-15T12:00:00',
    end: '2024-01-15T13:00:00',
    type: 'break' as const
  }
];

const StaffScheduleManager = () => {
  const { data: staff = [], isLoading } = useStaff();
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [events, setEvents] = useState(mockEvents);

  const handleAddEvent = (newEvent: any) => {
    const event = {
      id: Date.now().toString(),
      ...newEvent
    };
    setEvents([...events, event]);
  };

  const transformedStaff = staff.map(member => ({
    id: member.id || '',
    name: member.name,
    image: member.imageUrl || `https://images.unsplash.com/photo-1494790108755-2616b612b494?w=400&h=400&fit=crop&crop=face`,
    specialties: member.specialties || []
  }));

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading staff schedule...</div>;
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
          <StaffCalendarView
            staff={transformedStaff}
            events={events}
            onAddEvent={handleAddEvent}
          />
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
                      <option key={member.id} value={member.id || ''}>
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

                {!selectedStaffId && (
                  <div className="text-center py-8 text-muted-foreground">
                    Please select a staff member to manage their availability.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Time Off Approval */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Time Off Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Sarah Johnson - Vacation</p>
                      <p className="text-sm text-muted-foreground">Jan 20-25, 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Deny</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Michael Chen - Sick Leave</p>
                      <p className="text-sm text-muted-foreground">Jan 18, 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Deny</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Conflicts */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Conflicts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                    <p className="font-medium text-orange-800">Double Booking Alert</p>
                    <p className="text-sm text-orange-600">Sarah Johnson has overlapping appointments on Jan 22 at 2:00 PM</p>
                    <Button size="sm" variant="outline" className="mt-2">Resolve</Button>
                  </div>
                  <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-800">Availability Conflict</p>
                    <p className="text-sm text-yellow-600">Michael Chen scheduled outside working hours on Jan 23</p>
                    <Button size="sm" variant="outline" className="mt-2">Review</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Average Utilization</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Time Off</span>
                    <span className="font-medium">3 requests</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule Conflicts</span>
                    <span className="font-medium text-orange-600">2 conflicts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff On Duty Today</span>
                    <span className="font-medium">{staff.filter(s => s.status === 'active').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Bulk Schedule Update
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Copy Schedule Template
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
