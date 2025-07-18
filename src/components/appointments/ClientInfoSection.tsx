
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface ClientInfoSectionProps {
  clientName: string;
  clientPhone: string;
  clientData?: any;
  isAttended: boolean;
  onAttendanceChange: (attended: boolean) => void;
}

export const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
  clientName,
  clientPhone,
  clientData,
  isAttended,
  onAttendanceChange
}) => {
  const displayName = clientName && clientName !== 'Unknown Client' ? clientName : 'Unknown Client';
  const displayPhone = clientPhone && clientPhone !== 'No phone' ? clientPhone : 'No phone provided';

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-blue-900">Client Information</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isAttended ? "default" : "outline"}
              size="sm"
              onClick={() => onAttendanceChange(true)}
              className={isAttended ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Came
            </Button>
            <Button
              variant={!isAttended ? "default" : "outline"}
              size="sm"
              onClick={() => onAttendanceChange(false)}
              className={!isAttended ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50"}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Didn't come
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Client Name</p>
              <p className={`text-lg font-semibold ${displayName === 'Unknown Client' ? 'text-orange-600' : 'text-gray-900'}`}>
                {displayName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className={`text-lg font-medium ${displayPhone === 'No phone provided' ? 'text-gray-500' : 'text-gray-900'}`}>
                {displayPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              {clientData === undefined ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <Badge variant={clientData?.status === 'New' ? 'secondary' : 'default'}>
                  {clientData?.status || 'New'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {clientData?.email && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-gray-600">Email: <span className="font-medium">{clientData.email}</span></p>
          </div>
        )}

        {displayName === 'Unknown Client' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Client information appears to be incomplete. Consider updating the appointment with proper client details.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
