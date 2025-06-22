
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AppHeader = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Salon CRM
          </h1>
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
