
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateStaff } from "@/hooks/useCrmData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Staff as StaffType } from "@/services/supabaseApi";

const AddStaffDialog = () => {
  const createStaffMutation = useCreateStaff();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffType>>({
    name: "",
    email: "",
    phone: "",
    specialties: [],
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    breakStart: "12:00",
    breakEnd: "13:00",
    hourlyRate: 25,
    commissionRate: 35,
    status: "active",
    efficiency: 100,
    rating: 5.0,
    notes: ""
  });
  const [createdStaff, setCreatedStaff] = useState<StaffType | null>(null);

  const handleSpecialtyChange = (value: string) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    setNewStaff({ ...newStaff, specialties });
  };

  const handleAddStaff = () => {
    if (!user || !session) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add staff members",
        variant: "destructive"
      });
      return;
    }

    if (!newStaff.name || !newStaff.email) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and email",
        variant: "destructive"
      });
      return;
    }

    const staffToCreate = {
      ...newStaff,
      salonId: user.id
    } as StaffType;

    createStaffMutation.mutate(staffToCreate, {
      onSuccess: () => {
        setCreatedStaff(staffToCreate);
        toast({
          title: "Staff Added Successfully",
          description: `${staffToCreate.name} has been added to your team!`,
        });
        setTimeout(() => {
          resetForm();
        }, 2000);
      },
      onError: (error) => {
        console.error('Failed to create staff:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create staff member",
          variant: "destructive"
        });
      }
    });
  };

  const resetForm = () => {
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      specialties: [],
      workingHoursStart: "09:00",
      workingHoursEnd: "18:00",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      breakStart: "12:00",
      breakEnd: "13:00",
      hourlyRate: 25,
      commissionRate: 35,
      status: "active",
      efficiency: 100,
      rating: 5.0,
      notes: ""
    });
    setCreatedStaff(null);
    setIsOpen(false);
  };

  if (!user || !session) {
    return (
      <div className="text-sm text-red-600 p-2 border border-red-200 rounded">
        Please log in to add staff members.
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {createdStaff ? 'Staff Added Successfully!' : 'Add New Staff Member'}
          </DialogTitle>
        </DialogHeader>
        
        {createStaffMutation.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            <strong>Error:</strong> {createStaffMutation.error instanceof Error ? createStaffMutation.error.message : 'Failed to create staff member'}
          </div>
        )}

        {createdStaff ? (
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">{createdStaff.name} Added!</h3>
              <p className="text-sm text-green-700 mb-4">
                Staff member has been successfully added to your salon team.
              </p>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <Label className="text-xs text-gray-600">Staff Details</Label>
                  <p className="font-semibold">{createdStaff.name}</p>
                  <p className="text-sm text-gray-600">{createdStaff.email}</p>
                  {createdStaff.phone && (
                    <p className="text-sm text-gray-600">{createdStaff.phone}</p>
                  )}
                </div>
                {createdStaff.specialties && createdStaff.specialties.length > 0 && (
                  <div className="bg-white p-3 rounded border">
                    <Label className="text-xs text-gray-600">Specialties</Label>
                    <p className="text-sm">{createdStaff.specialties.join(', ')}</p>
                  </div>
                )}
                <div className="bg-white p-3 rounded border">
                  <Label className="text-xs text-gray-600">Working Hours</Label>
                  <p className="text-sm">{createdStaff.workingHoursStart} - {createdStaff.workingHoursEnd}</p>
                </div>
              </div>
            </div>
            
            <Button onClick={resetForm} className="w-full">
              Add Another Staff Member
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Quick Setup:</strong> Add your staff members to enable appointment booking.
              </p>
            </div>
            
            <div>
              <Label htmlFor="staffName">Full Name *</Label>
              <Input
                id="staffName"
                value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="staffEmail">Email *</Label>
              <Input
                id="staffEmail"
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="staffPhone">Phone</Label>
              <Input
                id="staffPhone"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="specialties">Specialties (comma separated)</Label>
              <Input
                id="specialties"
                value={newStaff.specialties?.join(', ') || ''}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                placeholder="e.g., Haircut, Coloring, Styling"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="workStart">Work Start</Label>
                <Input
                  id="workStart"
                  type="time"
                  value={newStaff.workingHoursStart}
                  onChange={(e) => setNewStaff({...newStaff, workingHoursStart: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="workEnd">Work End</Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={newStaff.workingHoursEnd}
                  onChange={(e) => setNewStaff({...newStaff, workingHoursEnd: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={newStaff.hourlyRate}
                  onChange={(e) => setNewStaff({...newStaff, hourlyRate: parseFloat(e.target.value)})}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="commission">Commission (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={newStaff.commissionRate}
                  onChange={(e) => setNewStaff({...newStaff, commissionRate: parseInt(e.target.value)})}
                  placeholder="35"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddStaff} 
                className="flex-1"
                disabled={createStaffMutation.isPending || !newStaff.name || !newStaff.email}
              >
                {createStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffDialog;
