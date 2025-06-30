
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, Clock, User, Phone, Mail, MapPin, 
  DollarSign, CreditCard, Edit, Trash2, History,
  Star, Tag, FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Appointment } from '@/services/types';
import { format } from 'date-fns';
import { EditAppointmentDialog } from './EditAppointmentDialog';
import { usePermissions } from '@/hooks/usePermissions';

interface DetailedAppointmentDialogProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_spent: number;
  visits: number;
  last_visit?: string;
  status: string;
  notes?: string;
  preferred_stylist?: string;
}

interface AppointmentHistory {
  id: string;
  date: string;
  service: string;
  price: number;
  status: string;
  staff_name?: string;
}

export const DetailedAppointmentDialog: React.FC<DetailedAppointmentDialogProps> = ({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const { hasPermissionSync } = usePermissions();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const canEdit = hasPermissionSync('appointments', 'edit');
  const canDelete = hasPermissionSync('appointments', 'delete');

  const { data: clientDetails } = useQuery({
    queryKey: ['client-details', appointment?.clientId],
    queryFn: async () => {
      if (!appointment?.clientId) return null;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', appointment.clientId)
        .single();

      if (error) throw error;
      return data as ClientDetails;
    },
    enabled: !!appointment?.clientId && isOpen,
  });

  const { data: clientHistory = [] } = useQuery({
    queryKey: ['client-appointment-history', appointment?.clientId],
    queryFn: async () => {
      if (!appointment?.clientId) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, date, service, price, status,
          staff:staff_id (name)
        `)
        .eq('client_id', appointment.clientId)
        .eq('salon_id', user?.id)
        .neq('id', appointment.id)
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data.map(apt => ({
        ...apt,
        staff_name: apt.staff?.name || 'Unknown'
      })) as AppointmentHistory[];
    },
    enabled: !!appointment?.clientId && isOpen,
  });

  const { data: staffDetails } = useQuery({
    queryKey: ['staff-details', appointment?.staffId],
    queryFn: async () => {
      if (!appointment?.staffId) return null;

      const { data, error } = await supabase
        .from('staff')
        .select('name, phone, email, specialties, rating')
        .eq('id', appointment.staffId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!appointment?.staffId && isOpen,
  });

  if (!appointment) return null;

  const statusColors = {
    'Scheduled': 'bg-blue-100 text-blue-800',
    'Confirmed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-emerald-100 text-emerald-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'No Show': 'bg-orange-100 text-orange-800'
  };

  const paymentStatusColors = {
    'paid': 'bg-green-100 text-green-800',
    'unpaid': 'bg-red-100 text-red-800',
    'partial': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Appointment Details
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <p className="font-medium">{appointment.startTime} - {appointment.endTime}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium text-lg">{appointment.service}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{appointment.duration || 60} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <p className="font-medium text-green-600">${appointment.price}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className={statusColors[appointment.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                      {appointment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <Badge className={paymentStatusColors[appointment.paymentStatus as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'}>
                      {appointment.paymentStatus?.toUpperCase() || 'UNPAID'}
                    </Badge>
                  </div>
                </div>

                {appointment.paymentMethod && (
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <p className="font-medium capitalize">{appointment.paymentMethod}</p>
                    </div>
                  </div>
                )}

                {staffDetails && (
                  <div>
                    <p className="text-sm text-gray-600">Staff Member</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="font-medium">{staffDetails.name}</p>
                      {staffDetails.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-sm">{staffDetails.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {appointment.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <p className="text-sm">{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-lg">{appointment.clientName}</p>
                  </div>

                  {appointment.clientPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="font-medium">{appointment.clientPhone}</p>
                      </div>
                    </div>
                  )}

                  {clientDetails && (
                    <>
                      {clientDetails.email && (
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <p className="font-medium">{clientDetails.email}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Visits</p>
                          <p className="font-medium">{clientDetails.visits}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Spent</p>
                          <p className="font-medium text-green-600">${clientDetails.total_spent}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Client Status</p>
                        <Badge variant="secondary" className="capitalize">
                          {clientDetails.status}
                        </Badge>
                      </div>

                      {clientDetails.preferred_stylist && (
                        <div>
                          <p className="text-sm text-gray-600">Preferred Stylist</p>
                          <p className="font-medium">{clientDetails.preferred_stylist}</p>
                        </div>
                      )}

                      {clientDetails.notes && (
                        <div>
                          <p className="text-sm text-gray-600">Client Notes</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{clientDetails.notes}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recent Appointment History */}
              {clientHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Recent Visits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {clientHistory.map((visit) => (
                        <div key={visit.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{visit.service}</p>
                            <p className="text-xs text-gray-600">
                              {format(new Date(visit.date), 'MMM d, yyyy')} • {visit.staff_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">${visit.price}</p>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${statusColors[visit.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {visit.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditAppointmentDialog
        appointment={appointment}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
};
