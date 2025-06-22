
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { profileApi } from '@/services/api/profileApi';
import { Building, Save, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const SalonProfileSection: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [salonInfo, setSalonInfo] = useState({
    salonName: '',
    phone: '',
    address: '',
    description: '',
    openingHours: '',
    closingHours: '',
    workingDays: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileApi.getProfile();
      if (profile) {
        setSalonInfo({
          salonName: profile.salonName || '',
          phone: profile.phone || '',
          address: '',
          description: '',
          openingHours: '09:00',
          closingHours: '18:00',
          workingDays: 'Monday - Friday'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await profileApi.updateProfile({
        salonName: salonInfo.salonName,
        phone: salonInfo.phone
      });
      
      toast({
        title: "Success",
        description: "Salon profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update salon profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Salon Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salonName">Salon Name</Label>
            <Input
              id="salonName"
              value={salonInfo.salonName}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, salonName: e.target.value }))}
              placeholder="Your Salon Name"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={salonInfo.phone}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={salonInfo.address}
            onChange={(e) => setSalonInfo(prev => ({ ...prev, address: e.target.value }))}
            placeholder="123 Main Street, City, State, ZIP"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={salonInfo.description}
            onChange={(e) => setSalonInfo(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of your salon..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="openingHours">Opening Hours</Label>
            <Input
              id="openingHours"
              type="time"
              value={salonInfo.openingHours}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, openingHours: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="closingHours">Closing Hours</Label>
            <Input
              id="closingHours"
              type="time"
              value={salonInfo.closingHours}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, closingHours: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="workingDays">Working Days</Label>
            <Input
              id="workingDays"
              value={salonInfo.workingDays}
              onChange={(e) => setSalonInfo(prev => ({ ...prev, workingDays: e.target.value }))}
              placeholder="Monday - Friday"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};
