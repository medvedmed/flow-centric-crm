
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors,
  Package,
  UserCheck,
  FileText,
  Settings,
  HelpCircle,
  Sparkles,
  Shield
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionArea } from "@/services/permissionApi";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredArea: PermissionArea;
  requiredAction: 'view' | 'create' | 'edit' | 'delete';
}

const mainMenuItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    requiredArea: "dashboard",
    requiredAction: "view"
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
    requiredArea: "appointments",
    requiredAction: "view"
  },
  {
    title: "Clients", 
    url: "/clients",
    icon: Users,
    requiredArea: "clients",
    requiredAction: "view"
  },
  {
    title: "Services",
    url: "/services", 
    icon: Scissors,
    requiredArea: "services",
    requiredAction: "view"
  },
  {
    title: "Staff",
    url: "/staff",
    icon: UserCheck,
    requiredArea: "staff_management",
    requiredAction: "view"
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package,
    requiredArea: "inventory",
    requiredAction: "view"
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
    requiredArea: "reports",
    requiredAction: "view"
  },
];

const adminMenuItems: NavItem[] = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    requiredArea: "settings",
    requiredAction: "view"
  },
  {
    title: "Help & Support",
    url: "/help",
    icon: HelpCircle,
    requiredArea: "dashboard",
    requiredAction: "view"
  },
];

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'salon_owner':
      return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
    case 'manager':
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    case 'staff':
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    case 'receptionist':
      return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'salon_owner':
      return 'Owner';
    case 'manager':
      return 'Manager';
    case 'staff':
      return 'Staff';
    case 'receptionist':
      return 'Receptionist';
    default:
      return 'User';
  }
};

export function AppSidebar() {
  const location = useLocation();
  const { hasPermissionSync, userRole, roleLoading } = usePermissions();

  const getAccessibleItems = (items: NavItem[]) => {
    if (roleLoading) return [];
    return items.filter(item => hasPermissionSync(item.requiredArea, item.requiredAction));
  };

  const accessibleMainItems = getAccessibleItems(mainMenuItems);
  const accessibleAdminItems = getAccessibleItems(adminMenuItems);

  return (
    <Sidebar className="border-r bg-white/95 backdrop-blur-sm">
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Aura Platform
            </h1>
            <p className="text-sm text-muted-foreground">Salon Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        {accessibleMainItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Salon Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accessibleMainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="hover:bg-teal-50 hover:text-teal-700 data-[state=open]:bg-teal-50 data-[state=open]:text-teal-700"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {accessibleAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accessibleAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="hover:bg-teal-50 hover:text-teal-700 data-[state=open]:bg-teal-50 data-[state=open]:text-teal-700"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <Shield className="text-white font-semibold text-sm w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Salon Admin</p>
            <div className="flex items-center gap-2 mt-1">
              {userRole && (
                <Badge className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(userRole)}`}>
                  {getRoleDisplayName(userRole)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
