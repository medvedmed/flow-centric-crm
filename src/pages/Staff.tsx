
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, UserCheck, Mail, Phone, Calendar, Edit, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const staffData = [
  {
    id: 1,
    name: "Emma Wilson",
    role: "Senior Stylist",
    email: "emma@salon.com",
    phone: "+1 (555) 101-2020",
    specialties: ["Haircut", "Coloring", "Styling"],
    schedule: "Mon-Fri 9AM-6PM",
    commission: 45,
    status: "active"
  },
  {
    id: 2,
    name: "Sophia Davis",
    role: "Hair Colorist",
    email: "sophia@salon.com",
    phone: "+1 (555) 202-3030",
    specialties: ["Coloring", "Highlights", "Balayage"],
    schedule: "Tue-Sat 10AM-7PM",
    commission: 40,
    status: "active"
  },
  {
    id: 3,
    name: "Olivia Brown",
    role: "Nail Technician",
    email: "olivia@salon.com",
    phone: "+1 (555) 303-4040",
    specialties: ["Manicure", "Pedicure", "Nail Art"],
    schedule: "Wed-Sun 9AM-5PM",
    commission: 35,
    status: "active"
  },
  {
    id: 4,
    name: "Isabella Miller",
    role: "Esthetician",
    email: "isabella@salon.com",
    phone: "+1 (555) 404-5050",
    specialties: ["Facial", "Skincare", "Massage"],
    schedule: "Mon-Thu 11AM-8PM",
    commission: 42,
    status: "active"
  },
];

const Staff = () => {
  const [staff, setStaff] = useState(staffData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    specialties: [],
    schedule: "",
    commission: "",
    notes: ""
  });

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.role || !newStaff.email) {
      toast({
        title: "Error",
        description: "Name, role, and email are required fields.",
        variant: "destructive",
      });
      return;
    }

    const staffMember = {
      id: staff.length + 1,
      name: newStaff.name,
      role: newStaff.role,
      email: newStaff.email,
      phone: newStaff.phone,
      specialties: newStaff.specialties,
      schedule: newStaff.schedule,
      commission: parseInt(newStaff.commission) || 35,
      status: "active"
    };

    setStaff([...staff, staffMember]);
    setNewStaff({
      name: "",
      role: "",
      email: "",
      phone: "",
      specialties: [],
      schedule: "",
      commission: "",
      notes: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Staff member added successfully!",
    });
  };

  const handleDeleteStaff = (id) => {
    setStaff(staff.filter(member => member.id !== id));
    toast({
      title: "Success",
      description: "Staff member removed successfully!",
    });
  };

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
          <DialogContent className="max-w-md">
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
                <Label htmlFor="role">Role *</Label>
                <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Senior Stylist">Senior Stylist</SelectItem>
                    <SelectItem value="Hair Stylist">Hair Stylist</SelectItem>
                    <SelectItem value="Hair Colorist">Hair Colorist</SelectItem>
                    <SelectItem value="Nail Technician">Nail Technician</SelectItem>
                    <SelectItem value="Esthetician">Esthetician</SelectItem>
                    <SelectItem value="Massage Therapist">Massage Therapist</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  value={newStaff.schedule}
                  onChange={(e) => setNewStaff({...newStaff, schedule: e.target.value})}
                  placeholder="e.g., Mon-Fri 9AM-6PM"
                />
              </div>
              <div>
                <Label htmlFor="commission">Commission (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={newStaff.commission}
                  onChange={(e) => setNewStaff({...newStaff, commission: e.target.value})}
                  placeholder="35"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddStaff} className="flex-1">
                  Add Staff Member
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
            <UserCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {Math.round(staff.reduce((sum, s) => sum + s.commission, 0) / staff.length)}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">On Duty Today</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">3</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search staff by name, role, or specialty..."
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
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <Badge 
                  variant={member.status === 'active' ? 'default' : 'secondary'}
                  className="bg-green-100 text-green-800"
                >
                  {member.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {member.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {member.schedule}
                </div>
              </div>

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

              <div className="flex justify-between items-center pt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Commission: </span>
                  <span className="font-semibold">{member.commission}%</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteStaff(member.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Staff;
