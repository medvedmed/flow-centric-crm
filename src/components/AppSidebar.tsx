
import React from 'react';
import {
  Home,
  Calendar,
  Users,
  UserCheck,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
  DollarSign,
  Package2
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton"
import PermissionGate from "./PermissionGate";

interface NavItemProps {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  requiredPermission: {
    area:
      | "dashboard"
      | "appointments"
      | "clients"
      | "staff_management"
      | "services"
      | "inventory"
      | "reports"
      | "settings"
      | "schedule_management"
      | "time_off_requests";
    action: "view" | "create" | "edit" | "delete";
  };
}

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    requiredPermission: { area: "dashboard" as const, action: "view" as const }
  },
  {
    title: "Appointments",
    url: "/appointments", 
    icon: Calendar,
    requiredPermission: { area: "appointments" as const, action: "view" as const }
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
    requiredPermission: { area: "clients" as const, action: "view" as const }
  },
  {
    title: "Staff",
    url: "/staff",
    icon: UserCheck,
    requiredPermission: { area: "staff_management" as const, action: "view" as const }
  },
  {
    title: "Services",
    url: "/services",
    icon: Package,
    requiredPermission: { area: "services" as const, action: "view" as const }
  },
  {
    title: "Finance",
    url: "/finance",
    icon: DollarSign,
    requiredPermission: { area: "reports" as const, action: "view" as const }
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package2,
    requiredPermission: { area: "inventory" as const, action: "view" as const }
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    requiredPermission: { area: "reports" as const, action: "view" as const }
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    requiredPermission: { area: "settings" as const, action: "view" as const }
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
    requiredPermission: { area: "dashboard" as const, action: "view" as const }
  }
];

export const AppSidebar: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const { isLoading } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-full flex-col overflow-y-auto border-r bg-secondary transition-transform duration-300 ease-in-out ${
        isOpen ? 'w-64 translate-x-0' : '-translate-x-full w-0'
      } lg:translate-x-0 lg:w-64`}
    >
      <div className="flex h-16 shrink-0 items-center px-4">
        <button
          onClick={toggleSidebar}
          className="mr-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </button>
        <span className="font-semibold text-2xl">CRM</span>
      </div>
      <nav className="flex flex-1 flex-col space-y-1 p-2">
        {isLoading ? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded-md" />
            ))}
          </>
        ) : (
          <>
            {navigationItems.map((item) => (
              <PermissionGate
                key={item.title}
                area={item.requiredPermission.area}
                action={item.requiredPermission.action}
              >
                <NavLink
                  to={item.url}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                      isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </PermissionGate>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
};
