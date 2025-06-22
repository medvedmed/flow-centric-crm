
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Scissors, Settings, Clock, CheckCircle } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { Link } from "react-router-dom";

const getRoleWelcomeContent = (role: string) => {
  switch (role) {
    case 'salon_owner':
      return {
        title: "Welcome to Your Salon Dashboard",
        subtitle: "Manage your entire salon operation from here",
        icon: <Settings className="w-8 h-8 text-purple-600" />,
        quickActions: [
          { title: "View Today's Schedule", icon: Calendar, link: "/appointments", color: "teal" },
          { title: "Manage Staff", icon: Users, link: "/staff", color: "blue" },
          { title: "Business Reports", icon: CheckCircle, link: "/reports", color: "green" },
          { title: "Salon Settings", icon: Settings, link: "/settings", color: "purple" }
        ],
        tips: [
          "Check your daily revenue and appointment metrics",
          "Review staff performance and schedules",
          "Monitor client retention and satisfaction"
        ]
      };
    case 'manager':
      return {
        title: "Manager Dashboard",
        subtitle: "Oversee operations and support your team",
        icon: <Users className="w-8 h-8 text-blue-600" />,
        quickActions: [
          { title: "Today's Appointments", icon: Calendar, link: "/appointments", color: "teal" },
          { title: "Staff Schedule", icon: Clock, link: "/staff", color: "blue" },
          { title: "Performance Reports", icon: CheckCircle, link: "/reports", color: "green" }
        ],
        tips: [
          "Monitor daily operations and staff performance",
          "Handle staff scheduling and time-off requests",
          "Review client feedback and service quality"
        ]
      };
    case 'staff':
      return {
        title: "Welcome to Your Schedule",
        subtitle: "Your appointments and tasks for today",
        icon: <Scissors className="w-8 h-8 text-green-600" />,
        quickActions: [
          { title: "My Schedule", icon: Calendar, link: "/appointments", color: "teal" },
          { title: "Client List", icon: Users, link: "/clients", color: "blue" }
        ],
        tips: [
          "Check your upcoming appointments",
          "Review client preferences and notes",
          "Update appointment status as you complete services"
        ]
      };
    case 'receptionist':
      return {
        title: "Front Desk Hub",
        subtitle: "Manage appointments and welcome clients",
        icon: <Calendar className="w-8 h-8 text-orange-600" />,
        quickActions: [
          { title: "Book Appointment", icon: Calendar, link: "/appointments", color: "teal" },
          { title: "Client Directory", icon: Users, link: "/clients", color: "blue" },
          { title: "Daily Reports", icon: CheckCircle, link: "/reports", color: "green" }
        ],
        tips: [
          "Manage walk-ins and appointment bookings",
          "Check client history before appointments",
          "Handle payment processing and receipts"
        ]
      };
    default:
      return {
        title: "Welcome to Salon CRM",
        subtitle: "Your salon management platform",
        icon: <Scissors className="w-8 h-8 text-teal-600" />,
        quickActions: [],
        tips: []
      };
  }
};

const RoleBasedWelcome = () => {
  const { userRole } = usePermissions();
  
  if (!userRole) return null;
  
  const content = getRoleWelcomeContent(userRole);
  
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-md">
            {content.icon}
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            {content.title}
          </CardTitle>
          <p className="text-muted-foreground">{content.subtitle}</p>
        </CardHeader>
      </Card>

      {content.quickActions.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-16 justify-start gap-3 border-2 hover:border-teal-300"
                  asChild
                >
                  <Link to={action.link}>
                    <action.icon className="w-6 h-6" />
                    <span className="font-medium">{action.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {content.tips.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Getting Started Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoleBasedWelcome;
