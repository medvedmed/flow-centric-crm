
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

interface AppointmentHistory {
  id: string;
  date: string;
  service: string;
  price: number;
  status: string;
  staff_id?: string;
  staff_name?: string;
}

interface AppointmentHistoryCardProps {
  clientHistory: AppointmentHistory[];
}

const formatDate = (dateString: string | undefined | null, formatString: string = 'MMM d, yyyy') => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const AppointmentHistoryCard: React.FC<AppointmentHistoryCardProps> = ({
  clientHistory
}) => {
  const statusColors = {
    'Scheduled': 'bg-blue-100 text-blue-800',
    'Confirmed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-emerald-100 text-emerald-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'No Show': 'bg-orange-100 text-orange-800'
  };

  if (clientHistory.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-4 h-4" />
          Recent Visits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clientHistory.map((visit) => (
            <div key={visit.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-sm">{visit.service}</p>
                <p className="text-xs text-gray-600">
                  {formatDate(visit.date)} • {visit.staff_name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">${visit.price}</p>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${statusColors[visit.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
                >
                  {visit.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
