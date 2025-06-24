
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreVertical, Plus, Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ReceiptPrinter } from './ReceiptPrinter';
import { MultiServiceSelector } from './MultiServiceSelector';
import { useStaff } from '@/hooks/staff/useStaffHooks';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enhancedAppointmentApi } from '@/services/api/enhancedAppointmentApi';
import { appointmentApi } from '@/services/api/appointmentApi';

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  staffId?: string;
}

type AppointmentStatus = "Scheduled" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "No Show";

interface AppointmentActionsProps {
  appointment: {
    id: string;
    clientName: string;
    status: string;
    service: string;
    price?: number;
    date: string;
    startTime: string;
    endTime: string;
  };
  onUpdate?: () => void;
}

export const AppointmentActions: React.FC<AppointmentActionsProps> = ({
  appointment,
  onUpdate
}) => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [showAddServices, setShowAddServices] = useState(false);
  
  const { data: staff = [] } = useStaff();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addServiceMutation = useMutation({
    mutationFn: async (services: SelectedService[]) => {
      const promises = services.map(service =>
        enhancedAppointmentApi.addServiceToAppointment(appointment.id, {
          service_name: service.name,
          service_price: service.price,
          service_duration: service.duration,
          staff_id: service.staffId
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Services Added",
        description: "Services have been successfully added to the appointment.",
      });
      setSelectedServices([]);
      setShowAddServices(false);
      onUpdate?.();
    },
    onError: (error) => {
      console.error('Error adding services:', error);
      toast({
        title: "Error",
        description: "Failed to add services. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: AppointmentStatus) => {
      return appointmentApi.updateAppointment(appointment.id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Status Updated",
        description: `Appointment status updated successfully.`,
      });
      onUpdate?.();
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive",
      });
    },
  });

  const handleAddServices = () => {
    if (selectedServices.length > 0) {
      addServiceMutation.mutate(selectedServices);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no show':
        return 'bg-gray-100 text-gray-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const canAddServices = appointment.status !== 'Completed' && appointment.status !== 'Cancelled';
  const canPrintReceipt = appointment.status === 'Completed';

  return (
    <div className="flex items-center gap-2">
      <Badge className={getStatusColor(appointment.status)}>
        {appointment.status}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canAddServices && (
            <Dialog open={showAddServices} onOpenChange={setShowAddServices}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Services
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Services to Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">Current Appointment</div>
                    <div className="text-sm text-gray-600">
                      {appointment.clientName} • {appointment.service}
                    </div>
                  </div>
                  
                  <MultiServiceSelector
                    selectedServices={selectedServices}
                    onServicesChange={setSelectedServices}
                    availableStaff={staff}
                  />
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddServices(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddServices}
                      disabled={selectedServices.length === 0 || addServiceMutation.isPending}
                    >
                      {addServiceMutation.isPending ? 'Adding...' : 'Add Services'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {appointment.status === 'Scheduled' && (
            <>
              <DropdownMenuItem 
                onClick={() => updateStatusMutation.mutate('In Progress')}
                disabled={updateStatusMutation.isPending}
              >
                <Clock className="w-4 h-4 mr-2" />
                Start Appointment
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => updateStatusMutation.mutate('Cancelled')}
                disabled={updateStatusMutation.isPending}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </DropdownMenuItem>
            </>
          )}

          {appointment.status === 'In Progress' && (
            <DropdownMenuItem 
              onClick={() => updateStatusMutation.mutate('Completed')}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </DropdownMenuItem>
          )}

          {canPrintReceipt && (
            <ReceiptPrinter 
              appointmentId={appointment.id}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Receipt className="w-4 h-4 mr-2" />
                  Print Receipt
                </DropdownMenuItem>
              }
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
