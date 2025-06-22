
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, UserCheck } from 'lucide-react';

interface AdminSetupDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AdminSetupDialog: React.FC<AdminSetupDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Role Assignment Needed
          </DialogTitle>
          <DialogDescription>
            Your account needs to be assigned a role by an administrator before you can access the system.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Waiting for Access</span>
            </div>
            <p className="text-sm text-orange-700">
              Please contact your salon administrator to assign you the appropriate role and permissions.
            </p>
          </div>
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
