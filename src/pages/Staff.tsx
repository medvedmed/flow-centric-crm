
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, UserCheck, Mail, Phone, Calendar, Edit, Trash, Clock, DollarSign } from "lucide-react";
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useCrmData";
import { Staff } from "@/services/supabaseApi";

const Staff = () => {
  const { data: staff = [], isLoading } = useStaff();
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
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

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email) {
      return;
    }

    createStaffMutation.mutate(newStaff as Staff, {
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
        setIsAddDialogOpen(false);
      }
    });
  };

  const handleUpdateStaff = () => {
    if (!editingStaff?.id) return;

    updateStaffMutation.mutate(
      { id: editingStaff.id, staff: editingStaff },
      {
        onSuccess: () => {
          setEditingStaff(null);
        }
      }
    );
  };

  const handleDeleteStaff = (id: string) => {
    deleteStaffMutation.mutate(id);
  };

  const handleSpecialtyChange = (value: string, isEditing = false) => {
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    if (isEditing && editingStaff) {
      setEditingStaff({ ...editingStaff, specialties });
    } else {
      setNewStaff({ ...newStaff, specialties });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading staff...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your salon team and their schedules.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Total Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{staff.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {staff.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Avg. Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {staff.length > 0 ? Math.round(staff.reduce((sum, s) => sum + (s.commissionRate || 0), 0) / staff.length) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Avg. Rating</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {staff.length > 0 ? (staff.reduce((sum, s) => sum + (s.rating || 0), 0) / staff.length).toFixed(1) : "0.0"}⭐
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search staff by name, email, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <Card key={member.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <Badge 
                  variant={member.status === 'active' ? 'default' : 'secondary'}
                  className={member.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {member.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {member.workingHoursStart} - {member.workingHoursEnd}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  ${member.hourlyRate}/hr • {member.commissionRate}% commission
                </div>
              </div>

              {member.specialties && member.specialties.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Rating: </span>
                  <span className="font-semibold">{member.rating}⭐</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Efficiency: </span>
                  <span className="font-semibold">{member.efficiency}%</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setEditingStaff(member)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Staff Member</DialogTitle>
                    </DialogHeader>
                    {editingStaff && (
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
                            onChange={(e) => handleSpecialtyChange(e.target.value, true)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editStatus">Status</Label>
                          <Select 
                            value={editingStaff.status} 
                            onValueChange={(value) => setEditingStaff({...editingStaff, status: value as Staff['status']})}
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
                          <Button variant="outline" onClick={() => setEditingStaff(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteStaff(member.id!)}
                  className="text-red-600 hover:text-red-700"
                  disabled={deleteStaffMutation.isPending}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No staff members found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms." : "Add your first staff member to get started."}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff Member
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Staff;
