
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';

export const SidebarToggle: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();

  console.log('SidebarToggle - isOpen:', isOpen);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        console.log('Sidebar toggle clicked');
        toggleSidebar();
      }}
      data-sidebar-toggle="true"
      className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 p-0 bg-white border shadow-sm hover:bg-gray-50 transition-colors"
      aria-label="Toggle sidebar"
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
