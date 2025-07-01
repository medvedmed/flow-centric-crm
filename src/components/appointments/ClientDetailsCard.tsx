
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail } from 'lucide-react';
import { Appointment } from '@/services/types';

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_spent: number;
  visits: number;
  last_visit?: string;
  status: string;
  notes?: string;
  preferred_stylist?: string;
}

interface ClientDetailsCardProps {
  appointment: Appointment;
  clientDetails?: ClientDetails | null;
}

export const ClientDetailsCard: React.FC<ClientDetailsCardProps> = ({
  appointment,
  clientDetails
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Client Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Name</p>
          <p className="font-medium text-lg">{appointment.clientName}</p>
        </div>

        {appointment.clientPhone && (
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-gray-500" />
              <p className="font-medium">{appointment.clientPhone}</p>
            </div>
          </div>
        )}

        {clientDetails && (
          <>
            {clientDetails.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="font-medium">{clientDetails.email}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="font-medium">{clientDetails.visits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="font-medium text-green-600">${clientDetails.total_spent || 0}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Client Status</p>
              <Badge variant="secondary" className="capitalize">
                {clientDetails.status || 'New'}
              </Badge>
            </div>

            {clientDetails.preferred_stylist && (
              <div>
                <p className="text-sm text-gray-600">Preferred Stylist</p>
                <p className="font-medium">{clientDetails.preferred_stylist}</p>
              </div>
            )}

            {clientDetails.notes && (
              <div>
                <p className="text-sm text-gray-600">Client Notes</p>
                <p className="text-sm bg-gray-50 p-2 rounded">{clientDetails.notes}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
