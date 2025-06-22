
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, Filter, Calendar, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { reportsApi } from "@/services/api/reportsApi";

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const Reports = () => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("last-6-months");
  
  const getMonthsFromRange = (range: string) => {
    switch (range) {
      case "last-week": return 1;
      case "last-month": return 1;
      case "last-3-months": return 3;
      case "last-6-months": return 6;
      case "last-year": return 12;
      default: return 6;
    }
  };

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-data', timeRange],
    queryFn: () => reportsApi.getRevenueData(getMonthsFromRange(timeRange)),
  });

  const { data: serviceData, isLoading: serviceLoading } = useQuery({
    queryKey: ['service-popularity'],
    queryFn: () => reportsApi.getServicePopularity(),
  });

  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['staff-performance'],
    queryFn: () => reportsApi.getStaffPerformance(),
  });

  const { data: clientMetrics, isLoading: clientLoading } = useQuery({
    queryKey: ['client-metrics'],
    queryFn: () => reportsApi.getClientMetrics(),
  });

  const handleExport = async (type: 'revenue' | 'services' | 'staff' | 'clients') => {
    try {
      await reportsApi.exportReport(type);
      toast({
        title: "Export Successful",
        description: "Report has been downloaded to your device.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the report.",
        variant: "destructive",
      });
    }
  };

  const totalRevenue = revenueData?.reduce((sum, item) => sum + item.revenue, 0) || 0;
  const totalAppointments = revenueData?.reduce((sum, item) => sum + item.appointments, 0) || 0;
  const averagePerAppointment = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Analyze your salon performance and business metrics.</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
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
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => handleExport('revenue')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              {revenueLoading ? "Loading..." : `${totalAppointments} appointments`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {clientLoading ? "..." : clientMetrics?.totalClients || 0}
            </div>
            <p className="text-xs text-blue-600">
              {clientLoading ? "Loading..." : `${clientMetrics?.newClients || 0} new this month`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Avg Per Visit</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ${averagePerAppointment.toFixed(0)}
            </div>
            <p className="text-xs text-purple-600">
              {revenueLoading ? "Loading..." : "Per appointment"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Returning Clients</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {clientLoading ? "..." : clientMetrics?.returningClients || 0}
            </div>
            <p className="text-xs text-orange-600">
              {clientLoading ? "Loading..." : "This month"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Service Popularity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceData?.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ service, count }) => `${service}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {serviceData?.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Staff Performance</CardTitle>
            <Button variant="outline" onClick={() => handleExport('staff')}>
              <Download className="w-4 h-4 mr-2" />
              Export Staff Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staffLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Staff Member</th>
                    <th className="text-right p-3 font-medium">Appointments</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-right p-3 font-medium">Rating</th>
                    <th className="text-right p-3 font-medium">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {staffData?.map((member, index) => (
                    <tr key={member.name} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{member.name}</td>
                      <td className="p-3 text-right">{member.appointments}</td>
                      <td className="p-3 text-right font-semibold">${member.revenue.toLocaleString()}</td>
                      <td className="p-3 text-right">{member.rating.toFixed(1)}/5.0</td>
                      <td className="p-3 text-right">
                        <Badge 
                          className={
                            member.revenue > 5000 ? 'bg-green-100 text-green-800' :
                            member.revenue > 2000 ? 'bg-blue-100 text-blue-800' :
                            member.revenue > 500 ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {member.revenue > 5000 ? 'Excellent' :
                           member.revenue > 2000 ? 'Good' :
                           member.revenue > 500 ? 'Average' :
                           'Needs Improvement'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Export Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => handleExport('revenue')} className="h-12">
              <Download className="w-4 h-4 mr-2" />
              Revenue Report
            </Button>
            <Button variant="outline" onClick={() => handleExport('services')} className="h-12">
              <Download className="w-4 h-4 mr-2" />
              Services Report
            </Button>
            <Button variant="outline" onClick={() => handleExport('staff')} className="h-12">
              <Download className="w-4 h-4 mr-2" />
              Staff Report
            </Button>
            <Button variant="outline" onClick={() => handleExport('clients')} className="h-12">
              <Download className="w-4 h-4 mr-2" />
              Client Metrics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
