import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AppointmentForm } from './AppointmentForm';
import { usePermissions } from '@/hooks/usePermissions';

interface AddAppointmentDialogProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedStaffId?: string;
  trigger?: React.ReactNode;
}

export const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  selectedDate,
  selectedTime,
  selectedStaffId,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermissionSync, userRole } = usePermissions();

  const canCreateAppointments = hasPermissionSync('appointments', 'create');
  const isStaff = userRole === 'staff';

  if (!canCreateAppointments || isStaff) {
    return null;
  }

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Book New Appointment
          </DialogTitle>
        </DialogHeader>
        <AppointmentForm
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedStaffId={selectedStaffId}
          onSuccess={handleSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
{showAddDialog && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">Add Appointment</h2>
      {/* You can replace below with a proper form */}
      <input 
        type="text" 
        placeholder="Client name" 
        className="w-full border p-2 mb-3 rounded" 
      />
      <input 
        type="datetime-local" 
        className="w-full border p-2 mb-3 rounded" 
      />
      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={() => setShowAddDialog(false)} 
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            // TODO: Handle Save
            setShowAddDialog(false);
          }} 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
