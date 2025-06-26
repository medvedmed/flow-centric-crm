
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  UserCog, 
  Scissors, 
  Package, 
  Warehouse, 
  BarChart3, 
  DollarSign, 
  Settings, 
  HelpCircle,
  TrendingUp,
  Home,
  UserCheck
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const menuItems = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Appointments', url: '/appointments', icon: Calendar },
      { title: 'Clients', url: '/clients', icon: Users },
      { title: 'Client Retention', url: '/client-retention', icon: UserCheck },
      { title: 'Staff', url: '/staff', icon: UserCog },
    ]
  },
  {
    title: 'Business',
    items: [
      { title: 'Services', url: '/services', icon: Scissors },
      { title: 'Products', url: '/products', icon: Package },
      { title: 'Inventory', url: '/inventory', icon: Warehouse },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { title: 'Reports', url: '/reports', icon: BarChart3 },
      { title: 'Finance', url: '/finance', icon: DollarSign },
    ]
  },
  {
    title: 'Support',
    items: [
      { title: 'Settings', url: '/settings', icon: Settings },
      { title: 'Help', url: '/help', icon: HelpCircle },
    ]
  }
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r bg-background">
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-3 py-2">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "text-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                        location.pathname === item.url && "bg-accent text-accent-foreground border-r-2 border-primary"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
