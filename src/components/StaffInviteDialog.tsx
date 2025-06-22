
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Copy, Mail } from "lucide-react";

const StaffInviteDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    phone: ''
  });
  const [inviteLink, setInviteLink] = useState('');
  const { toast } = useToast();

  const handleGenerateInvite = () => {
    if (!formData.email || !formData.name || !formData.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Generate a unique invite link (in a real app, this would be done server-side)
    const inviteToken = btoa(`${formData.email}:${formData.role}:${Date.now()}`);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/invite/${inviteToken}`;
    
    setInviteLink(link);
    
    toast({
      title: "Invite Generated",
      description: "Share this link with your new team member"
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard"
    });
  };

  const handleSendEmail = () => {
    const subject = `Invitation to join ${window.location.hostname}`;
    const body = `Hi ${formData.name},\n\nYou've been invited to join our salon team as a ${formData.role}.\n\nClick this link to get started: ${inviteLink}\n\nWelcome to the team!`;
    const mailtoLink = `mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const resetForm = () => {
    setFormData({ email: '', name: '', role: '', phone: '' });
    setInviteLink('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Staff Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Invite New Team Member
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff Member</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter phone number (optional)"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          {!inviteLink ? (
            <Button 
              onClick={handleGenerateInvite} 
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              Generate Invite Link
            </Button>
          ) : (
            <Card className="bg-gradient-to-r from-teal-50 to-cyan-50">
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm font-medium">Invite Link Generated</Label>
                <div className="p-2 bg-white rounded border text-sm break-all">
                  {inviteLink}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopyLink} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={handleSendEmail} variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffInviteDialog;
