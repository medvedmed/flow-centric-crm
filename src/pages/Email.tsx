
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { plus, search, mail, mail-minus, mail-plus, edit, delete } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const emailsData = [
  {
    id: 1,
    from: "john.doe@company.com",
    to: "sarah.johnson@email.com",
    subject: "Follow-up on Enterprise Software Discussion",
    preview: "Thank you for taking the time to discuss your enterprise software needs...",
    date: "2024-06-24 10:30 AM",
    status: "Sent",
    type: "Outbound",
    contact: "Sarah Johnson"
  },
  {
    id: 2,
    from: "m.chen@designstudio.com",
    to: "info@company.com",
    subject: "Re: Marketing Automation Proposal",
    preview: "We've reviewed your proposal and have some questions about the implementation timeline...",
    date: "2024-06-23 2:15 PM",
    status: "Received",
    type: "Inbound",
    contact: "Michael Chen"
  },
  {
    id: 3,
    from: "jane.smith@company.com",
    to: "emily@startup.co",
    subject: "Welcome to Our Service!",
    preview: "Welcome aboard! We're excited to help you achieve your business goals...",
    date: "2024-06-22 9:00 AM",
    status: "Delivered",
    type: "Outbound",
    contact: "Emily Rodriguez"
  },
];

const templatesData = [
  {
    id: 1,
    name: "Welcome Email",
    subject: "Welcome to [Company Name]!",
    content: "Dear [Name],\n\nWelcome to our service! We're excited to help you achieve your goals...",
    category: "Onboarding"
  },
  {
    id: 2,
    name: "Follow-up Template",
    subject: "Following up on our conversation",
    content: "Hi [Name],\n\nI wanted to follow up on our recent conversation about...",
    category: "Sales"
  },
  {
    id: 3,
    name: "Proposal Follow-up",
    subject: "Your proposal is ready for review",
    content: "Dear [Name],\n\nI'm pleased to share your customized proposal...",
    category: "Sales"
  },
];

const Email = () => {
  const [emails, setEmails] = useState(emailsData);
  const [templates, setTemplates] = useState(templatesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    content: "",
    template: ""
  });

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    category: "General"
  });

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendEmail = () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const email = {
      id: emails.length + 1,
      from: "john.doe@company.com",
      to: newEmail.to,
      subject: newEmail.subject,
      preview: newEmail.content.substring(0, 100) + "...",
      date: new Date().toLocaleString(),
      status: "Sent",
      type: "Outbound",
      contact: newEmail.to.split("@")[0]
    };

    setEmails([email, ...emails]);
    setNewEmail({
      to: "",
      subject: "",
      content: "",
      template: ""
    });
    setIsComposeOpen(false);
    
    toast({
      title: "Success",
      description: "Email sent successfully!",
    });
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast({
        title: "Error",
        description: "Please fill in all template fields.",
        variant: "destructive",
      });
      return;
    }

    const template = {
      id: templates.length + 1,
      ...newTemplate
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: "",
      subject: "",
      content: "",
      category: "General"
    });
    setIsTemplateDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Template saved successfully!",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sent': return 'bg-green-100 text-green-800';
      case 'Delivered': return 'bg-blue-100 text-blue-800';
      case 'Received': return 'bg-purple-100 text-purple-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sentEmails = emails.filter(e => e.type === 'Outbound');
  const receivedEmails = emails.filter(e => e.type === 'Inbound');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Email Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage your email communication and templates efficiently.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <plus className="w-4 h-4 mr-2" />
                Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Email Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name *</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="templateCategory">Category</Label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="templateSubject">Subject Line *</Label>
                  <Input
                    id="templateSubject"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                    placeholder="Enter subject line"
                  />
                </div>
                <div>
                  <Label htmlFor="templateContent">Email Content *</Label>
                  <Textarea
                    id="templateContent"
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                    placeholder="Enter email content..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveTemplate} className="flex-1">
                    Save Template
                  </Button>
                  <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <plus className="w-4 h-4 mr-2" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="to">To *</Label>
                  <Input
                    id="to"
                    value={newEmail.to}
                    onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                    placeholder="recipient@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="template">Use Template (Optional)</Label>
                  <Select value={newEmail.template} onValueChange={(value) => {
                    const template = templates.find(t => t.id.toString() === value);
                    if (template) {
                      setNewEmail({
                        ...newEmail,
                        template: value,
                        subject: template.subject,
                        content: template.content
                      });
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                    placeholder="Enter subject line"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    value={newEmail.content}
                    onChange={(e) => setNewEmail({...newEmail, content: e.target.value})}
                    placeholder="Type your message here..."
                    rows={8}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSendEmail} className="flex-1">
                    Send Email
                  </Button>
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Emails</CardTitle>
            <mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{emails.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Sent</CardTitle>
            <mail-plus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{sentEmails.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Received</CardTitle>
            <mail-minus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{receivedEmails.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Templates</CardTitle>
            <mail className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{templates.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Email Management Tabs */}
      <Tabs defaultValue="emails" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emails">Email History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-6">
          {/* Search */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search emails by subject, contact, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Email History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEmails.map((email) => (
                  <div key={email.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(email.status)}>
                            {email.status}
                          </Badge>
                          <Badge variant="outline">
                            {email.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{email.date}</span>
                        </div>
                        <h4 className="font-semibold mb-1">{email.subject}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {email.type === 'Outbound' ? `To: ${email.to}` : `From: ${email.from}`}
                        </p>
                        <p className="text-sm">{email.preview}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <delete className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                        <p className="text-sm">{template.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Content Preview:</p>
                        <p className="text-sm line-clamp-3">{template.content.substring(0, 100)}...</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Use Template
                        </Button>
                        <Button variant="ghost" size="sm">
                          <edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <delete className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Email;
