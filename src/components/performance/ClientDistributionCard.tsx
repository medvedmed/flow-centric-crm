
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { ClientCategorization } from './types';

interface ClientDistributionCardProps {
  clientCategorizationData: ClientCategorization[];
}

export const ClientDistributionCard: React.FC<ClientDistributionCardProps> = ({
  clientCategorizationData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Client Distribution (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {clientCategorizationData.map((staff) => (
            <div key={staff.staff_id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{staff.staff_name}</h3>
                <div className="text-sm text-muted-foreground">
                  Total clients served: {staff.total_clients}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {staff.new_clients} New
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {staff.regular_clients} Regular
                </Badge>
              </div>
            </div>
          ))}
          {clientCategorizationData.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No client data available for the last 30 days
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
