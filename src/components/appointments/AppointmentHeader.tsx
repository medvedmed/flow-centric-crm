
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Edit, Trash2 } from 'lucide-react';

interface AppointmentHeaderProps {
  canEdit: boolean;
  canDelete: boolean;
  onEditClick: () => void;
  onDelete?: () => void;
}

export const AppointmentHeader: React.FC<AppointmentHeaderProps> = ({
  canEdit,
  canDelete,
  onEditClick,
  onDelete
}) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Appointment Details
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </DialogTitle>
    </DialogHeader>
  );
};
