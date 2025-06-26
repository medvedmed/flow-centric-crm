
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { retentionApi } from '@/services/api/retentionApi';

interface ClientRetentionChartProps {
  startDate?: string;
  endDate?: string;
}

export const ClientRetentionChart: React.FC<ClientRetentionChartProps> = ({
  startDate,
  endDate
}) => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['retention-summary', startDate, endDate],
    queryFn: () => retentionApi.getRetentionSummary(startDate, endDate)
  });

  const { data: staffMetrics } = useQuery({
    queryKey: ['staff-retention-metrics', startDate, endDate],
    queryFn: () => retentionApi.getStaffRetentionMetrics(startDate, endDate)
  });

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-700 rounded"></div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-700 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pieData = [
    { name: 'New Clients', value: summary.newClients, color: '#10B981' },
    { name: 'Returning Clients', value: summary.returningClients, color: '#F59E0B' },
    { name: 'Loyal Clients', value: summary.loyalClients, color: '#8B5CF6' }
  ].filter(item => item.value > 0);

  const barData = staffMetrics?.slice(0, 8).map(staff => ({
    name: staff.staff_name,
    retention: staff.retention_rate,
    total: staff.total_unique_clients
  })) || [];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Client Category Distribution */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Client Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">No client data available</div>
                <div className="text-gray-500 text-sm">Complete appointments to see client distribution</div>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-gray-300 text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staff Retention Rates */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Staff Retention Rates</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#374151', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'retention' ? `${value.toFixed(1)}%` : value,
                    name === 'retention' ? 'Retention Rate' : 'Total Clients'
                  ]}
                />
                <Bar dataKey="retention" fill="#3B82F6" name="retention" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">No staff data available</div>
                <div className="text-gray-500 text-sm">Complete appointments to see retention rates</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
