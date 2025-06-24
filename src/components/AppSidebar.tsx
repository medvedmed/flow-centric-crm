
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
import { Link } from 'react-router-dom';

const AppSidebar = () => {
  const menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Appointments', url: '/appointments', icon: Calendar },
    { title: 'Clients', url: '/clients', icon: Users },
    { title: 'Staff', url: '/staff', icon: UserCheck },
    { title: 'Services', url: '/services', icon: Briefcase },
    { title: 'Products', url: '/products', icon: ShoppingBag },
    { title: 'Inventory', url: '/inventory', icon: Package },
    { title: 'Finance', url: '/finance', icon: DollarSign },
    { title: 'Reports', url: '/reports', icon: BarChart3 },
    { title: 'Settings', url: '/settings', icon: Settings },
    { title: 'Help', url: '/help', icon: HelpCircle },
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
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
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
