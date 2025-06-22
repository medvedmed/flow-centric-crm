
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionArea } from '@/services/permissionApi';
import { 
  Calendar, 
  Users, 
  UserPlus, 
  Scissors, 
  Package, 
  BarChart3, 
  Settings,
  Clock,
  CalendarClock
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredArea: PermissionArea;
  requiredAction: 'view' | 'create' | 'edit' | 'delete';
}

const navigationItems: NavItem[] = [
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    requiredArea: 'appointments',
    requiredAction: 'view'
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
    requiredArea: 'clients',
    requiredAction: 'view'
  },
  {
    title: 'Staff',
    href: '/staff',
    icon: UserPlus,
    requiredArea: 'staff_management',
    requiredAction: 'view'
  },
  {
    title: 'Services',
    href: '/services',
    icon: Scissors,
    requiredArea: 'services',
    requiredAction: 'view'
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    requiredArea: 'inventory',
    requiredAction: 'view'
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    requiredArea: 'reports',
    requiredAction: 'view'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    requiredArea: 'settings',
    requiredAction: 'view'
  }
];

export const useProtectedNavigation = () => {
  const { hasPermissionSync, roleLoading } = usePermissions();

  const getAccessibleNavItems = (): NavItem[] => {
    if (roleLoading) return [];
    
    return navigationItems.filter(item => 
      hasPermissionSync(item.requiredArea, item.requiredAction)
    );
  };

  return {
    accessibleNavItems: getAccessibleNavItems(),
    roleLoading
  };
};

export const ProtectedNavItem: React.FC<{
  item: NavItem;
  children: React.ReactNode;
}> = ({ item, children }) => {
  const { hasPermissionSync } = usePermissions();
  
  if (!hasPermissionSync(item.requiredArea, item.requiredAction)) {
    return null;
  }

  return <>{children}</>;
};
