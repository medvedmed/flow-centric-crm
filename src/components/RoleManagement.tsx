import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRoleManagement } from '@/hooks/usePermissions';
import { Shield, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { AppRole, PermissionArea } from '@/services/permissionApi';

const PERMISSION_AREAS: Record<PermissionArea, string> = {
  dashboard: 'Dashboard',
  appointments: 'Appointments',
  clients: 'Clients', 
  staff_management: 'Staff Management',
  services: 'Services',
  inventory: 'Inventory',
  reports: 'Reports',
  settings: 'Settings',
  schedule_management: 'Schedule Management',
  time_off_requests: 'Time Off Requests',
  finance: 'Finance',
  products: 'Products'
};
