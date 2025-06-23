
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { profileApi } from '@/services/api/profileApi';
import { Building, Save, MapPin, Phone, Mail, Clock, Globe, Users } from 'lucide-react';

interface EnhancedSalonData {
  salonName: string;
  phone: string;
  address: string;
  description: string;
  openingHours: string;
  closingHours: string;
  workingDays: string[];
  website: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export const EnhancedSalonProfile: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [salonData, setSalonData] = useState<EnhancedSalonData>({
    salonName: '',
    phone: '',
    address: '',
    description: '',
    openingHours: '09:00',
    closingHours: '18:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileApi.getProfile();
      if (profile) {
        setSalonData({
          salonName: profile.salon_name || '',
          phone: profile.phone || '',
          address: (profile as any).address || '',
          description: (profile as any).description || '',
          openingHours: (profile as any).opening_hours || '09:00',
          closingHours: (profile as any).closing_hours || '18:00',
          workingDays: (profile as any).working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          website: (profile as any).website || '',
          socialMedia: (profile as any).social_media || { facebook: '', instagram: '', twitter: '' }
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
        salon_name: salonData.salonName,
        phone: salonData.phone,
        ...(salonData.address && { address: salonData.address }),
        ...(salonData.description && { description: salonData.description }),
        ...(salonData.openingHours && { opening_hours: salonData.openingHours }),
        ...(salonData.closingHours && { closing_hours: salonData.closingHours }),
        ...(salonData.workingDays && { working_days: salonData.workingDays }),
        ...(salonData.website && { website: salonData.website }),
        ...(salonData.socialMedia && { social_media: salonData.socialMedia })
      } as any);
      
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

  const toggleWorkingDay = (day: string) => {
    setSalonData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const updateSocialMedia = (platform: string, value: string) => {
    setSalonData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Complete Salon Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salonName">Salon Name *</Label>
              <Input
                id="salonName"
                value={salonData.salonName}
                onChange={(e) => setSalonData(prev => ({ ...prev, salonName: e.target.value }))}
                placeholder="Your Salon Name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={salonData.phone}
                onChange={(e) => setSalonData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Full Address</Label>
            <Textarea
              id="address"
              value={salonData.address}
              onChange={(e) => setSalonData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main Street, City, State, ZIP Code"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description">Salon Description</Label>
            <Textarea
              id="description"
              value={salonData.description}
              onChange={(e) => setSalonData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your salon's services, atmosphere, and what makes it special..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              value={salonData.website}
              onChange={(e) => setSalonData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yoursalon.com"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Operating Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openingHours">Opening Time</Label>
              <Input
                id="openingHours"
                type="time"
                value={salonData.openingHours}
                onChange={(e) => setSalonData(prev => ({ ...prev, openingHours: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="closingHours">Closing Time</Label>
              <Input
                id="closingHours"
                type="time"
                value={salonData.closingHours}
                onChange={(e) => setSalonData(prev => ({ ...prev, closingHours: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Working Days</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {daysOfWeek.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Switch
                    id={day}
                    checked={salonData.workingDays.includes(day)}
                    onCheckedChange={() => toggleWorkingDay(day)}
                  />
                  <Label htmlFor={day} className="text-sm">{day}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social Media
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook Page</Label>
              <Input
                id="facebook"
                value={salonData.socialMedia.facebook}
                onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                placeholder="https://facebook.com/yoursalon"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram Handle</Label>
              <Input
                id="instagram"
                value={salonData.socialMedia.instagram}
                onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                placeholder="@yoursalon"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter Handle</Label>
              <Input
                id="twitter"
                value={salonData.socialMedia.twitter}
                onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                placeholder="@yoursalon"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Complete Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};
