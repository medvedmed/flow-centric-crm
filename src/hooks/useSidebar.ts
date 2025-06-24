
import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    console.log('toggleSidebar called, current state:', isOpen);
    setIsOpen(prev => {
      const newState = !prev;
      console.log('Setting sidebar to:', newState);
      return newState;
    });
  };

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: sidebar open by default
        setIsOpen(true);
      } else {
        // Mobile/tablet: sidebar closed by default
        setIsOpen(false);
      }
    };

    // Handle clicks outside sidebar on mobile
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 1024 && isOpen) {
        const sidebar = document.querySelector('[data-sidebar="true"]');
        const toggle = document.querySelector('[data-sidebar-toggle="true"]');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            toggle && !toggle.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    // Initialize on mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return {
    isOpen,
    toggleSidebar,
    setIsOpen
  };
};
