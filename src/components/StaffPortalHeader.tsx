
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';
import { useStaffAuth } from '@/hooks/useStaffAuth';

export const StaffPortalHeader: React.FC = () => {
  const { staffData, clearStaffSession } = useStaffAuth();

  const handleLogout = () => {
    clearStaffSession();
    window.location.href = '/';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Staff Portal</h1>
              <p className="text-sm text-gray-600">Welcome, {staffData?.name}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Staff Member
          </Badge>
        </div>
        
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};
