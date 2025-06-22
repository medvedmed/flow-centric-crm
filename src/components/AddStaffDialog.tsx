
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useCreateStaff } from "@/hooks/useCrmData";
import type { Staff as StaffType } from "@/services/supabaseApi";

const AddStaffDialog = () => {
  const createStaffMutation = useCreateStaff();
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
    hourlyRate: 0,
    commissionRate: 35,
    status: "active",
    efficiency: 100,
    rating: 5.0,
    notes: ""
  });

  const handleSpecialtyChange = (value: string) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    setNewStaff({ ...newStaff, specialties });
  };

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email) {
      return;
    }

    createStaffMutation.mutate(newStaff as StaffType, {
      onSuccess: () => {
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
          hourlyRate: 0,
          commissionRate: 35,
          status: "active",
          efficiency: 100,
          rating: 5.0,
          notes: ""
        });
        setIsOpen(false);
      }
    });
  };

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
          <DialogTitle>Add New Staff Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
                placeholder="0"
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
              disabled={createStaffMutation.isPending}
            >
              {createStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffDialog;
