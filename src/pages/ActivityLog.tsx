
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, Clock, User } from 'lucide-react';
import { DailyActivityLog } from '@/components/DailyActivityLog';

const ActivityLog = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Activity Log
            </h1>
            <p className="text-gray-600">Track all activities and changes in your salon</p>
          </div>
        </div>
      </div>

      {/* Activity Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Activities</CardTitle>
            <Calendar className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">24</div>
            <p className="text-xs text-gray-500">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Appointments Created</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">18</div>
            <p className="text-xs text-gray-500">+5 new today</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Client Updates</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">7</div>
            <p className="text-xs text-gray-500">Profile changes</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Changes</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-gray-500">Settings modified</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Log Component */}
      <Card className="bg-white/70 backdrop-blur-sm border-violet-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyActivityLog selectedDate={new Date()} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;
