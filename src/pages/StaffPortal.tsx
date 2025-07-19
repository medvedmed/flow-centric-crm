
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { StaffPortalHeader } from '@/components/StaffPortalHeader';
import { StaffPortalSidebar } from '@/components/StaffPortalSidebar';
import StaffDashboard from '@/components/StaffDashboard';
import { StaffLoginDialog } from '@/components/StaffLoginDialog';

export const StaffPortal: React.FC = () => {
  const { isStaff, isLoading, staffData } = useStaffAuth();
  const [showLogin, setShowLogin] = React.useState(!isStaff);

  React.useEffect(() => {
    setShowLogin(!isStaff);
  }, [isStaff]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        <StaffLoginDialog
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSuccess={() => setShowLogin(false)}
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Staff Portal</h1>
            <p className="text-gray-600 mb-6">Please log in with your staff credentials to access your portal.</p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors"
            >
              Staff Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffPortalHeader />
      <div className="flex h-[calc(100vh-73px)]">
        <StaffPortalSidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/staff/appointments" replace />} />
              <Route path="/appointments" element={<StaffDashboard />} />
              <Route path="/schedule" element={<div>My Schedule - Coming Soon</div>} />
              <Route path="/clients" element={<div>My Clients - Coming Soon</div>} />
              <Route path="/performance" element={<div>My Performance - Coming Soon</div>} />
              <Route path="/profile" element={<div>My Profile - Coming Soon</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPortal;
