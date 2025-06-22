
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, Plus } from "lucide-react";
import { useStaff, useDeleteStaff } from "@/hooks/useCrmData";
import type { Staff as StaffType } from "@/services/supabaseApi";
import StaffStats from "./StaffStats";
import StaffCard from "./StaffCard";
import AddStaffDialog from "./AddStaffDialog";

const StaffOverview = () => {
  const { data: staff = [], isLoading } = useStaff();
  const deleteStaffMutation = useDeleteStaff();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteStaff = (id: string) => {
    deleteStaffMutation.mutate(id);
  };

  const handleEditStaff = (staff: StaffType) => {
    // This is handled by the EditStaffDialog component
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading staff...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StaffStats staff={staff} />

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
          <StaffCard
            key={member.id}
            member={member}
            onEdit={handleEditStaff}
            onDelete={handleDeleteStaff}
            isDeleting={deleteStaffMutation.isPending}
          />
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
            {!searchTerm && <AddStaffDialog />}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffOverview;
