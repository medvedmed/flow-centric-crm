
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Staff } from '@/services/types';
import { StaffCredentials } from './StaffCredentials';
import { StaffActions } from './StaffActions';

interface StaffCardProps {
  staff: Staff;
  showPassword: boolean;
  onTogglePassword: () => void;
  onCopyCredentials: () => void;
  onEditStaff: () => void;
  onDeleteStaff: () => void;
}

export const StaffCard = ({
  staff,
  showPassword,
  onTogglePassword,
  onCopyCredentials,
  onEditStaff,
  onDeleteStaff
}: StaffCardProps) => {
  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{staff.name}</h3>
              <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                {staff.status}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {staff.email && <p>{staff.email}</p>}
              {staff.phone && <p>{staff.phone}</p>}
              {staff.specialties && staff.specialties.length > 0 && (
                <p>Specialties: {staff.specialties.join(', ')}</p>
              )}
            </div>

            {staff.staffLoginId && staff.staffLoginPassword && (
              <StaffCredentials
                staffId={staff.staffLoginId}
                staffPassword={staff.staffLoginPassword}
                showPassword={showPassword}
                onTogglePassword={onTogglePassword}
                onCopyCredentials={onCopyCredentials}
              />
            )}
          </div>

          <StaffActions
            staffId={staff.id}
            staffName={staff.name}
            onEditStaff={onEditStaff}
            onDeleteStaff={onDeleteStaff}
          />
        </div>
      </CardContent>
    </Card>
  );
};
