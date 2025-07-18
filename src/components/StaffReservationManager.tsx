import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, User, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';

interface StaffReservation {
  id: string;
  staff_id: string;
  staff_name: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: 'active' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface StaffReservationManagerProps {
  staffId?: string;
  selectedDate?: string;
  selectedTime?: string;
  onClose: () => void;
}

export const StaffReservationManager: React.FC<StaffReservationManagerProps> = ({
  staffId: propStaffId,
  selectedDate: propSelectedDate,
  selectedTime: propSelectedTime,
  onClose
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<StaffReservation[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<StaffReservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: propStaffId || '',
    date: propSelectedDate || new Date().toISOString().split('T')[0],
    start_time: propSelectedTime || '09:00',
    end_time: '10:00',
    reason: 'Personal Time',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (propStaffId) {
      setFormData(prev => ({ ...prev, staff_id: propStaffId }));
    }
    if (propSelectedDate) {
      setFormData(prev => ({ ...prev, date: propSelectedDate }));
    }
    if (propSelectedTime) {
      setFormData(prev => ({ ...prev, start_time: propSelectedTime }));
    }
  }, [propStaffId, propSelectedDate, propSelectedTime]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load staff
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, name')
        .eq('salon_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (staffError) throw staffError;
      setStaff(staffData || []);

      // Load reservations
      await loadReservations();
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load reservation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('staff_availability')
        .select(`
          id,
          staff_id,
          date,
          start_time,
          end_time,
          reason,
          is_available,
          staff:staff_id (
            name
          )
        `)
        .eq('salon_id', user.id)
        .eq('is_available', false)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      const formattedReservations = data?.map(item => ({
        id: item.id,
        staff_id: item.staff_id,
        staff_name: (item.staff as any)?.name || 'Unknown',
        date: item.date,
        start_time: item.start_time,
        end_time: item.end_time,
        reason: item.reason || 'Reserved',
        status: 'active' as const,
        notes: '',
        created_at: '',
        updated_at: ''
      })) || [];

      setReservations(formattedReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  };

  const handleCreateReservation = async () => {
    if (!user || !formData.staff_id || !formData.date || !formData.start_time || !formData.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('staff_availability')
        .insert({
          salon_id: user.id,
          staff_id: formData.staff_id,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_available: false,
          reason: `${formData.reason}${formData.notes ? ` - ${formData.notes}` : ''}`
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff time reserved successfully",
      });

      setShowForm(false);
      setFormData({
        staff_id: propStaffId || '',
        date: propSelectedDate || new Date().toISOString().split('T')[0],
        start_time: propSelectedTime || '09:00',
        end_time: '10:00',
        reason: 'Personal Time',
        notes: ''
      });
      await loadReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Error",
        description: "Failed to create reservation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('staff_availability')
        .delete()
        .eq('id', reservationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reservation removed successfully",
      });

      await loadReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast({
        title: "Error",
        description: "Failed to remove reservation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Staff Reservation Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Manage staff reservations and blocked time slots
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Reservation
            </Button>
          </div>

          {/* Create/Edit Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingReservation ? 'Edit Reservation' : 'Create New Reservation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staff">Staff Member</Label>
                    <Select
                      value={formData.staff_id}
                      onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Select
                      value={formData.reason}
                      onValueChange={(value) => setFormData({ ...formData, reason: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Personal Time">Personal Time</SelectItem>
                        <SelectItem value="Break">Break</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional details about this reservation..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateReservation}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {loading ? 'Saving...' : editingReservation ? 'Update Reservation' : 'Create Reservation'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingReservation(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reservations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Active Reservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No reservations found</p>
                  <p className="text-sm text-gray-400">Create a new reservation to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{reservation.staff_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{formatDate(reservation.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                          </span>
                        </div>
                        <Badge className={getStatusColor(reservation.status)} variant="outline">
                          {reservation.reason}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReservation(reservation.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};