
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

  console.log('AppSidebar - isOpen:', isOpen);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        data-sidebar="true"
        className={`fixed left-0 top-0 z-50 flex h-full flex-col overflow-y-auto border-r bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
        } lg:translate-x-0 lg:shadow-none lg:relative lg:z-auto`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b">
          <span className="font-semibold text-xl md:text-2xl text-teal-600">Salon CRM</span>
          <button
            data-sidebar-toggle="true"
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-1 flex-col space-y-1 p-2">
          {isLoading ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
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
                    onClick={() => {
                      console.log(`Navigating to ${item.url}`);
                      // Close sidebar on mobile when clicking a link
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 rounded-md p-3 text-sm font-medium transition-colors hover:bg-teal-50 hover:text-teal-700 ${
                        isActive 
                          ? 'bg-teal-100 text-teal-700 border-r-2 border-teal-600' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                </PermissionGate>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};
