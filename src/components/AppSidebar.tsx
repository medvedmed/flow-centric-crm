
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
import { 
  layout-dashboard, 
  contact, 
  users, 
  database,
  database-backup,
  calendar,
  mail,
  file,
  settings,
  help-circle,
  cog
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: layout-dashboard,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: contact,
  },
  {
    title: "Leads", 
    url: "/leads",
    icon: users,
  },
  {
    title: "Deals",
    url: "/deals", 
    icon: database,
  },
  {
    title: "Companies",
    url: "/companies",
    icon: database-backup,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: calendar,
  },
  {
    title: "Email",
    url: "/email",
    icon: mail,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: file,
  },
];

const adminMenuItems = [
  {
    title: "User Management",
    url: "/users",
    icon: users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: settings,
  },
  {
    title: "Help & Support",
    url: "/help",
    icon: help-circle,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r bg-white/95 backdrop-blur-sm">
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <cog className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Aura CRM
            </h1>
            <p className="text-sm text-muted-foreground">Professional Edition</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-blue-50 hover:text-blue-700 data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700"
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-blue-50 hover:text-blue-700 data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700"
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
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Sales Manager</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
