
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';

export const SidebarToggle: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="md:hidden fixed top-4 left-4 z-50 h-10 w-10 p-0"
    >
      {isOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
};
