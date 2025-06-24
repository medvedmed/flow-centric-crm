
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { AlertTriangle } from 'lucide-react';

interface DroppableTimeSlotProps {
  staffId: string;
  time: string;
  children: React.ReactNode;
  hasConflict?: boolean;
}

export const DroppableTimeSlot: React.FC<DroppableTimeSlotProps> = ({ 
  staffId, 
  time, 
  children, 
  hasConflict = false 
}) => {
  const dropId = `${staffId}-${time}`;
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      staffId,
      time,
      type: 'timeSlot'
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-[60px] transition-all duration-200 ${
        isOver 
          ? hasConflict 
            ? 'bg-red-50 border-2 border-red-300 border-dashed rounded' 
            : 'bg-blue-50 border-2 border-blue-300 border-dashed rounded'
          : ''
      }`}
    >
      {children}
      {isOver && hasConflict && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 rounded">
          <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            Slot Occupied
          </div>
        </div>
      )}
    </div>
  );
};
