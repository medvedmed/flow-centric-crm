
import React from 'react';
import { 
  Calendar, 
  Users, 
  Briefcase, 
  UserCheck, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Home,
  ShoppingBag
} from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ProtectedSidebarNav } from './ProtectedSidebarNav';

const AppSidebar = () => {
  const menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home, area: 'dashboard' as const },
    { title: 'Appointments', url: '/appointments', icon: Calendar, area: 'appointments' as const },
    { title: 'Clients', url: '/clients', icon: Users, area: 'clients' as const },
    { title: 'Staff', url: '/staff', icon: UserCheck, area: 'staff' as const },
    { title: 'Services', url: '/services', icon: Briefcase, area: 'services' as const },
    { title: 'Products', url: '/products', icon: ShoppingBag, area: 'inventory' as const },
    { title: 'Inventory', url: '/inventory', icon: Package, area: 'inventory' as const },
    { title: 'Finance', url: '/finance', icon: DollarSign, area: 'finance' as const },
    { title: 'Reports', url: '/reports', icon: BarChart3, area: 'reports' as const },
    { title: 'Settings', url: '/settings', icon: Settings, area: 'settings' as const },
    { title: 'Help', url: '/help', icon: HelpCircle, area: 'help' as const },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <ProtectedSidebarNav
                    item={item}
                    area={item.area}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export { AppSidebar };
