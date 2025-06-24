
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { StaffAvailabilityManager } from './StaffAvailabilityManager';

interface StaffAvailabilitySectionProps {
  staffId?: string;
}

export const StaffAvailabilitySection: React.FC<StaffAvailabilitySectionProps> = ({ staffId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Staff Availability Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StaffAvailabilityManager 
          staffId={staffId} 
          showStaffSelector={!staffId} 
        />
      </CardContent>
    </Card>
  );
};
