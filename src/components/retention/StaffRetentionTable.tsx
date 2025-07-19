import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp } from 'lucide-react';
import { retentionApi, StaffRetentionMetrics } from '@/services/api/retentionApi';
interface StaffRetentionTableProps {
  startDate?: string;
  endDate?: string;
  selectedStaffId?: string;
}
export const StaffRetentionTable: React.FC<StaffRetentionTableProps> = ({
  startDate,
  endDate,
  selectedStaffId
}) => {
  const {
    data: staffMetrics,
    isLoading
  } = useQuery({
    queryKey: ['staff-retention-metrics', startDate, endDate],
    queryFn: () => retentionApi.getStaffRetentionMetrics(startDate, endDate)
  });
  const filteredMetrics = selectedStaffId ? staffMetrics?.filter(staff => staff.staff_id === selectedStaffId) : staffMetrics;
  const getRetentionBadge = (rate: number) => {
    if (rate >= 70) return {
      variant: 'default' as const,
      className: 'bg-green-600 text-white',
      text: 'Excellent'
    };
    if (rate >= 50) return {
      variant: 'secondary' as const,
      className: 'bg-orange-600 text-white',
      text: 'Good'
    };
    return {
      variant: 'destructive' as const,
      className: 'bg-red-600 text-white',
      text: 'Needs Improvement'
    };
  };
  if (isLoading) {
    return <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Staff Retention Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-700 rounded"></div>)}
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <TrendingUp className="w-5 h-5" />
          Staff Retention Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-slate-50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium py-3 px-2">Staff</th>
                <th className="text-center text-gray-400 font-medium py-3 px-2">Total Clients</th>
                <th className="text-center text-gray-400 font-medium py-3 px-2">New</th>
                <th className="text-center text-gray-400 font-medium py-3 px-2">Returning</th>
                <th className="text-center text-gray-400 font-medium py-3 px-2">Loyal</th>
                <th className="text-center text-gray-400 font-medium py-3 px-2">Retention Rate</th>
                <th className="text-center text-gray-400 font-medium py-3 px-2">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics?.map(staff => {
              const badge = getRetentionBadge(staff.retention_rate);
              return <tr key={staff.staff_id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {staff.staff_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-950">{staff.staff_name}</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <span className="font-bold text-base text-violet-950">{staff.total_unique_clients}</span>
                    </td>
                    <td className="text-center py-4 px-2">
                      <div className="flex flex-col items-center">
                        <span className="text-green-400 font-medium">{staff.new_clients}</span>
                        <span className="text-xs text-gray-500">
                          {staff.total_unique_clients > 0 ? (staff.new_clients / staff.total_unique_clients * 100).toFixed(0) + '%' : '0%'}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <div className="flex flex-col items-center">
                        <span className="text-orange-400 font-medium">{staff.returning_clients}</span>
                        <span className="text-xs text-gray-500">
                          {staff.total_unique_clients > 0 ? (staff.returning_clients / staff.total_unique_clients * 100).toFixed(0) + '%' : '0%'}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2">
                      <div className="flex flex-col items-center">
                        <span className="text-purple-400 font-medium">{staff.loyal_clients}</span>
                        <span className="text-xs text-gray-500">
                          {staff.total_unique_clients > 0 ? (staff.loyal_clients / staff.total_unique_clients * 100).toFixed(0) + '%' : '0%'}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-2 bg-slate-50">
                      <span className="font-bold text-lg text-purple-400">
                        {staff.retention_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-4 px-2">
                      <Badge className={badge.className}>
                        {badge.text}
                      </Badge>
                    </td>
                  </tr>;
            })}
            </tbody>
          </table>

          {(!filteredMetrics || filteredMetrics.length === 0) && <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400 mb-2">No staff retention data found</div>
              <div className="text-gray-500 text-sm">
                Retention data will appear once appointments are completed
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
};