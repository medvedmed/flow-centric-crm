
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { StaffLoginDialog } from './StaffLoginDialog';
import { useNavigate } from 'react-router-dom';

export const StaffLoginButton: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = () => {
    setShowLogin(false);
    navigate('/staff-portal');
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowLogin(true)}
        className="flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        Staff Login
      </Button>
      
      <StaffLoginDialog
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};
