
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users,
  BarChart3,
  Clock,
  User
} from 'lucide-react';

const staffMenuItems = [
  {
    title: 'My Schedule',
    items: [
      { title: 'Today\'s Appointments', url: '/staff/appointments', icon: Calendar },
      { title: 'My Schedule', url: '/staff/schedule', icon: Clock },
    ]
  },
  {
    title: 'My Clients',
    items: [
      { title: 'My Clients', url: '/staff/clients', icon: Users },
    ]
  },
  {
    title: 'Performance',
    items: [
      { title: 'My Performance', url: '/staff/performance', icon: BarChart3 },
    ]
  },
  {
    title: 'Profile',
    items: [
      { title: 'My Profile', url: '/staff/profile', icon: User },
    ]
  }
];

export const StaffPortalSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
          Staff Portal
        </h2>
        
        <div className="space-y-6">
          {staffMenuItems.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      location.pathname === item.url
                        ? "bg-green-50 text-green-700 border-r-2 border-green-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
