
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Clock, DollarSign, Edit, Trash } from "lucide-react";
import type { Staff as StaffType } from "@/services/supabaseApi";
import EditStaffDialog from "./EditStaffDialog";

interface StaffCardProps {
  member: StaffType;
  onEdit: (staff: StaffType) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const StaffCard = ({ member, onEdit, onDelete, isDeleting }: StaffCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(member.id!)}
            className="text-red-600 hover:text-red-700"
            disabled={isDeleting}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
      <EditStaffDialog 
        staff={member} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </Card>
  );
};

export default StaffCard;
