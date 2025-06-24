
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useSidebar } from '@/hooks/useSidebar';

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

const getWelcomeMessage = (role: string) => {
  switch (role) {
    case 'salon_owner':
      return 'Salon CRM - Owner Portal';
    case 'manager':
      return 'Salon CRM - Management';
    case 'staff':
      return 'Salon CRM - Staff Portal';
    case 'receptionist':
      return 'Salon CRM - Front Desk';
    default:
      return 'Salon CRM';
  }
};

const AppHeader = () => {
  const { user, signOut } = useAuth();
  const { userRole } = usePermissions();
  const { toggleSidebar } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            {getWelcomeMessage(userRole || '')}
          </h1>
          {userRole && (
            <Badge className={`text-xs ${getRoleBadgeColor(userRole)}`}>
              {getRoleDisplayName(userRole)}
            </Badge>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.email}</p>
                {userRole && (
                  <Badge className={`text-xs w-fit ${getRoleBadgeColor(userRole)}`}>
                    {getRoleDisplayName(userRole)}
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
