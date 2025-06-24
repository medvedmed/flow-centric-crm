
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  MoreVertical, 
  DollarSign, 
  Ban, 
  Clock, 
  CheckCircle, 
  UserX, 
  Trash2,
  Receipt
} from 'lucide-react';

interface InteractiveAppointmentCardProps {
  appointment: {
    id: string;
    client_name: string;
    service: string;
    start_time: string;
    end_time: string;
    price: number;
    status: string;
    payment_status: string;
    staff_id: string;
    notes?: string;
  };
  onAppointmentUpdate?: (appointmentId: string) => void;
}

export const InteractiveAppointmentCard: React.FC<InteractiveAppointmentCardProps> = ({
  appointment,
  onAppointmentUpdate
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, paymentStatus }: { status?: string; paymentStatus?: string }) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (paymentStatus) updateData.payment_status = paymentStatus;
      
      if (paymentStatus === 'paid') {
        updateData.payment_date = new Date().toISOString();
        updateData.payment_method = 'cash'; // Default payment method
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointment.id);

      if (error) throw error;

      // If marking as paid, create financial transaction
      if (paymentStatus === 'paid') {
        const { data: profile } = await supabase.auth.getUser();
        if (profile.user) {
          await supabase.from('financial_transactions').insert([{
            salon_id: profile.user.id,
            transaction_type: 'income',
            category: 'Service Payment',
            amount: appointment.price,
            description: `Payment for ${appointment.service} - ${appointment.client_name}`,
            payment_method: 'cash',
            reference_id: appointment.id,
            reference_type: 'appointment',
            transaction_date: new Date().toISOString().split('T')[0],
            created_by: profile.user.id
          }]);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      if (onAppointmentUpdate) {
        onAppointmentUpdate(appointment.id);
      }
      
      if (variables.paymentStatus === 'paid') {
        toast({
          title: "Payment Recorded",
          description: `Payment of $${appointment.price} recorded successfully!`,
        });
      } else if (variables.status) {
        toast({
          title: "Status Updated",
          description: `Appointment status changed to ${variables.status}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update appointment",
        variant: "destructive",
      });
    },
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      if (onAppointmentUpdate) {
        onAppointmentUpdate(appointment.id);
      }
      toast({
        title: "Appointment Deleted",
        description: "Appointment has been successfully deleted",
      });
      setShowDeleteDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete appointment",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = () => {
    if (appointment.payment_status === 'paid') return 'bg-green-500 hover:bg-green-600';
    
    switch (appointment.status) {
      case 'Cancelled': return 'bg-red-500 hover:bg-red-600';
      case 'In Progress': return 'bg-blue-500 hover:bg-blue-600';
      case 'Completed': return 'bg-green-500 hover:bg-green-600';
      case 'No Show': return 'bg-orange-500 hover:bg-orange-600';
      default: return 'bg-gray-100 hover:bg-gray-200 text-gray-900';
    }
  };

  const getStatusBadge = () => {
    if (appointment.payment_status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Paid</Badge>;
    }
    
    switch (appointment.status) {
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'No Show':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">No Show</Badge>;
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Card className={`p-3 cursor-pointer transition-all duration-200 ${getStatusColor()} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold truncate">
                {appointment.client_name}
              </p>
              {getStatusBadge()}
            </div>
            <p className="text-xs opacity-90 truncate">
              {appointment.service}
            </p>
            <p className="text-xs opacity-75">
              {appointment.start_time} - {appointment.end_time}
            </p>
            <p className="text-xs font-medium mt-1">
              {formatCurrency(appointment.price)}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {appointment.payment_status !== 'paid' && (
                <DropdownMenuItem 
                  onClick={() => updateStatusMutation.mutate({ paymentStatus: 'paid' })}
                  disabled={updateStatusMutation.isPending}
                >
                  <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                  Mark as Paid
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={() => updateStatusMutation.mutate({ status: 'In Progress' })}
                disabled={updateStatusMutation.isPending}
              >
                <Clock className="mr-2 h-4 w-4 text-blue-600" />
                In Progress
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => updateStatusMutation.mutate({ status: 'Completed' })}
                disabled={updateStatusMutation.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Mark Completed
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => updateStatusMutation.mutate({ status: 'No Show' })}
                disabled={updateStatusMutation.isPending}
              >
                <UserX className="mr-2 h-4 w-4 text-orange-600" />
                No Show
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => updateStatusMutation.mutate({ status: 'Cancelled' })}
                disabled={updateStatusMutation.isPending}
              >
                <Ban className="mr-2 h-4 w-4 text-red-600" />
                Cancel
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment for {appointment.client_name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteAppointmentMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
