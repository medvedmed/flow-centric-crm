
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateStaff } from "@/hooks/useCrmData";
import type { Staff as StaffType } from "@/services/supabaseApi";

interface EditStaffDialogProps {
  staff: StaffType;
}

const EditStaffDialog = ({ staff }: EditStaffDialogProps) => {
  const updateStaffMutation = useUpdateStaff();
  const [editingStaff, setEditingStaff] = useState<StaffType>(staff);

  const handleSpecialtyChange = (value: string) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    setEditingStaff({ ...editingStaff, specialties });
  };

  const handleUpdateStaff = () => {
    if (!editingStaff?.id) return;

    updateStaffMutation.mutate(
      { id: editingStaff.id, staff: editingStaff },
      {
        onSuccess: () => {
          // Dialog will close automatically
        }
      }
    );
  };

  return (
    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Staff Member</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="editName">Full Name *</Label>
          <Input
            id="editName"
            value={editingStaff.name}
            onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="editEmail">Email *</Label>
          <Input
            id="editEmail"
            type="email"
            value={editingStaff.email}
            onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="editPhone">Phone</Label>
          <Input
            id="editPhone"
            value={editingStaff.phone || ''}
            onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="editSpecialties">Specialties</Label>
          <Input
            id="editSpecialties"
            value={editingStaff.specialties?.join(', ') || ''}
            onChange={(e) => handleSpecialtyChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="editStatus">Status</Label>
          <Select 
            value={editingStaff.status} 
            onValueChange={(value) => setEditingStaff({...editingStaff, status: value as StaffType['status']})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleUpdateStaff} 
            className="flex-1"
            disabled={updateStaffMutation.isPending}
          >
            {updateStaffMutation.isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default EditStaffDialog;
