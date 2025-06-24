
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { StaffPerformance } from './types';

interface StaffPerformanceCardProps {
  performanceData: StaffPerformance[];
  isLoading: boolean;
}

export const StaffPerformanceCard: React.FC<StaffPerformanceCardProps> = ({
  performanceData,
  isLoading
}) => {
  if (isLoading) {
    return <div>Loading staff performance...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Staff Performance (This Month)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {performanceData.map((staff) => (
            <div key={staff.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{staff.staff_name}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  <span>{staff.appointments_completed} appointments</span>
                  <span>{staff.total_clients} clients</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">${staff.total_revenue.toFixed(2)}</div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">{staff.new_clients} new</Badge>
                  <Badge variant="outline">{staff.regular_clients} regular</Badge>
                </div>
              </div>
            </div>
          ))}
          {performanceData.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No performance data available for this month
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
