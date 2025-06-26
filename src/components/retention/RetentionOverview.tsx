
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, UserCheck, Award, Clock } from 'lucide-react';
import { retentionApi } from '@/services/api/retentionApi';

interface RetentionOverviewProps {
  startDate?: string;
  endDate?: string;
}

export const RetentionOverview: React.FC<RetentionOverviewProps> = ({
  startDate,
  endDate
}) => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['retention-summary', startDate, endDate],
    queryFn: () => retentionApi.getRetentionSummary(startDate, endDate)
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      title: 'Total Clients',
      value: summary.totalClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'New Clients',
      value: summary.newClients,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      percentage: summary.totalClients > 0 ? (summary.newClients / summary.totalClients * 100).toFixed(1) + '%' : '0%'
    },
    {
      title: 'Returning Clients',
      value: summary.returningClients,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      percentage: summary.totalClients > 0 ? (summary.returningClients / summary.totalClients * 100).toFixed(1) + '%' : '0%'
    },
    {
      title: 'Loyal Clients',
      value: summary.loyalClients,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      percentage: summary.totalClients > 0 ? (summary.loyalClients / summary.totalClients * 100).toFixed(1) + '%' : '0%'
    },
    {
      title: 'Retention Rate',
      value: summary.overallRetentionRate.toFixed(1) + '%',
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      subtitle: `${summary.averageVisitsPerClient.toFixed(1)} avg visits`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                {card.percentage && (
                  <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-700">
                    {card.percentage}
                  </Badge>
                )}
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
