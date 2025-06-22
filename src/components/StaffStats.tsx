
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, DollarSign, Calendar } from "lucide-react";
import type { Staff as StaffType } from "@/services/supabaseApi";

interface StaffStatsProps {
  staff: StaffType[];
}

const StaffStats = ({ staff }: StaffStatsProps) => {
  const activeStaffCount = staff.filter(s => s.status === 'active').length;
  const avgCommission = staff.length > 0 ? Math.round(staff.reduce((sum, s) => sum + (s.commissionRate || 0), 0) / staff.length) : 0;
  const avgRating = staff.length > 0 ? (staff.reduce((sum, s) => sum + (s.rating || 0), 0) / staff.length).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-700">Total Staff</CardTitle>
          <UserCheck className="h-4 w-4 text-teal-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-900">{staff.length}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Active Staff</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{activeStaffCount}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Avg. Commission</CardTitle>
          <DollarSign className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900">{avgCommission}%</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Avg. Rating</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{avgRating}⭐</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffStats;
