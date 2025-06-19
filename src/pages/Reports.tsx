
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { file, download, filter, calendar } from "lucide-react";

const salesReportData = [
  { month: 'Jan', revenue: 45000, deals: 12, leads: 120 },
  { month: 'Feb', revenue: 52000, deals: 15, leads: 140 },
  { month: 'Mar', revenue: 48000, deals: 11, leads: 110 },
  { month: 'Apr', revenue: 61000, deals: 18, leads: 180 },
  { month: 'May', revenue: 55000, deals: 16, leads: 160 },
  { month: 'Jun', revenue: 67000, deals: 20, leads: 200 },
];

const leadConversionData = [
  { stage: 'Leads', value: 500, color: '#3b82f6' },
  { stage: 'Qualified', value: 350, color: '#8b5cf6' },
  { stage: 'Proposals', value: 150, color: '#06b6d4' },
  { stage: 'Closed Won', value: 45, color: '#10b981' },
];

const teamPerformanceData = [
  { name: 'John Doe', deals: 25, revenue: 125000, activities: 84 },
  { name: 'Jane Smith', deals: 22, revenue: 98000, activities: 78 },
  { name: 'Mike Johnson', deals: 18, revenue: 87000, activities: 65 },
  { name: 'Sarah Wilson', deals: 15, revenue: 72000, activities: 58 },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Analyze your sales performance and business metrics.</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="last-6-months">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2">
            <filter className="w-4 h-4" />
            Filters
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
            <file className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">$328,000</div>
            <p className="text-xs text-green-600">+15% from last period</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Deals Closed</CardTitle>
            <file className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">92</div>
            <p className="text-xs text-blue-600">+12% from last period</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Conversion Rate</CardTitle>
            <file className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">9.2%</div>
            <p className="text-xs text-purple-600">+2.1% from last period</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Avg Deal Size</CardTitle>
            <file className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">$3,565</div>
            <p className="text-xs text-orange-600">+8% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesReportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesReportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="deals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Conversion Funnel */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Lead Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadConversionData.map((item, index) => (
                <div key={item.stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{item.value}</span>
                    {index > 0 && (
                      <Badge variant="secondary">
                        {Math.round((item.value / leadConversionData[index - 1].value) * 100)}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Team Member</th>
                  <th className="text-right p-3 font-medium">Deals Closed</th>
                  <th className="text-right p-3 font-medium">Revenue Generated</th>
                  <th className="text-right p-3 font-medium">Activities</th>
                  <th className="text-right p-3 font-medium">Performance</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformanceData.map((member, index) => (
                  <tr key={member.name} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{member.name}</td>
                    <td className="p-3 text-right">{member.deals}</td>
                    <td className="p-3 text-right font-semibold">${member.revenue.toLocaleString()}</td>
                    <td className="p-3 text-right">{member.activities}</td>
                    <td className="p-3 text-right">
                      <Badge 
                        className={
                          index === 0 ? 'bg-green-100 text-green-800' :
                          index === 1 ? 'bg-blue-100 text-blue-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {index === 0 ? 'Excellent' :
                         index === 1 ? 'Good' :
                         index === 2 ? 'Average' :
                         'Needs Improvement'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <download className="w-4 h-4" />
              Export Sales Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <download className="w-4 h-4" />
              Export Lead Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2 h-12">
              <download className="w-4 h-4" />
              Export Activity Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
