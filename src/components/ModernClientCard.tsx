
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, User, Calendar, DollarSign, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  isPortalEnabled?: boolean;
  visits?: number;
  totalSpent?: number;
  lastVisit?: string;
}

interface ModernClientCardProps {
  client: Client;
  onViewHistory: (clientId: string) => void;
}

export const ModernClientCard: React.FC<ModernClientCardProps> = ({ client, onViewHistory }) => {
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'new': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'inactive': return 'bg-gradient-to-r from-gray-400 to-slate-500';
      default: return 'bg-gradient-to-r from-purple-400 to-pink-500';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20">
        {/* Gradient Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-cyan-50/30 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Status Indicator */}
        <div className={`absolute top-0 right-0 w-20 h-20 ${getStatusColor(client.status)} opacity-10 rounded-bl-full`} />
        
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-white/50 shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.name}`} />
                <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-500 text-white font-semibold">
                  {getInitials(client.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-teal-700 transition-colors">
                  {client.name}
                </h3>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
            </div>
            
            <Badge 
              className={`${getStatusColor(client.status)} text-white border-0 shadow-lg px-3 py-1`}
            >
              {client.status || 'New'}
            </Badge>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4">
            {client.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-teal-500" />
                <span>{client.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-cyan-500" />
              <span className="truncate">{client.email}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-100/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-teal-700 font-medium">Visits</span>
              </div>
              <p className="text-lg font-bold text-teal-800">{client.visits || 0}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100/50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-medium">Spent</span>
              </div>
              <p className="text-lg font-bold text-green-800">${client.totalSpent || 0}</p>
            </div>
          </div>

          {/* Last Visit */}
          {client.lastVisit && (
            <p className="text-xs text-gray-500 mb-4">
              Last visit: {new Date(client.lastVisit).toLocaleDateString()}
            </p>
          )}

          {/* Action Button */}
          <Button 
            onClick={() => onViewHistory(client.id)}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View History
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
