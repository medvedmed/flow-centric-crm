
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Appointment } from '@/services/types';
import { EditAppointmentDialog } from './EditAppointmentDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { AppointmentHeader } from './appointments/AppointmentHeader';
import { AppointmentDetailsCard } from './appointments/AppointmentDetailsCard';
import { ClientDetailsCard } from './appointments/ClientDetailsCard';
import { AppointmentHistoryCard } from './appointments/AppointmentHistoryCard';

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
  staff_id?: string;
  staff_name?: string;
}

interface StaffDetails {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  specialties?: string[];
  rating?: number;
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

      if (error) {
        console.error('Error fetching client details:', error);
        return null;
      }
      
      // Map database fields to expected interface
      return {
        id: data.id,
        name: data.full_name,
        email: data.email || '',
        phone: data.phone || undefined,
        total_spent: data.total_spent || 0,
        visits: data.total_visits || 0,
        last_visit: data.last_visit_date || undefined,
        status: data.status || 'active',
        notes: data.notes || undefined,
        preferred_stylist: undefined
      } as ClientDetails;
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
          id, start_time, status, staff_id,
          services:service_id(name, price)
        `)
        .eq('client_id', appointment.clientId)
        .eq('organization_id', user?.id)
        .neq('id', appointment.id)
        .order('start_time', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching client history:', error);
        return [];
      }
      
      // Get staff names separately to avoid the relationship conflict
      const appointmentsWithStaff = await Promise.all(
        (data || []).map(async (apt: any) => {
          let staffName = 'Unassigned';
          if (apt.staff_id) {
            const { data: staffData } = await supabase
              .from('staff')
              .select('name')
              .eq('id', apt.staff_id)
              .single();
            staffName = staffData?.name || 'Unknown';
          }
          
          return {
            id: apt.id,
            date: apt.start_time ? new Date(apt.start_time).toISOString().split('T')[0] : '',
            service: apt.services?.name || 'Service',
            price: apt.services?.price || 0,
            status: apt.status || 'Scheduled',
            staff_id: apt.staff_id,
            staff_name: staffName
          };
        })
      );

      return appointmentsWithStaff as AppointmentHistory[];
    },
    enabled: !!appointment?.clientId && isOpen,
  });

  const { data: staffDetails } = useQuery({
    queryKey: ['staff-details', appointment?.staffId],
    queryFn: async () => {
      if (!appointment?.staffId) return null;

      const { data, error } = await supabase
        .from('staff')
        .select('id, name, phone, email, specialties, rating')
        .eq('id', appointment.staffId)
        .single();

      if (error) {
        console.error('Error fetching staff details:', error);
        return null;
      }
      return data as StaffDetails;
    },
    enabled: !!appointment?.staffId && isOpen,
  });

  if (!appointment) return null;

  const handleEditClick = () => {
    setShowEditDialog(true);
  };

  const handleEditClose = () => {
    setShowEditDialog(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AppointmentHeader
            canEdit={canEdit}
            canDelete={canDelete}
            onEditClick={handleEditClick}
            onDelete={onDelete}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AppointmentDetailsCard
              appointment={appointment}
              staffDetails={staffDetails}
            />

            <div className="space-y-6">
              <ClientDetailsCard
                appointment={appointment}
                clientDetails={clientDetails}
              />

              <AppointmentHistoryCard
                clientHistory={clientHistory}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditAppointmentDialog
        appointment={appointment}
        isOpen={showEditDialog}
        onClose={handleEditClose}
      />
    </>
  );
};
