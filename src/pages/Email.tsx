
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Mail, Send, Reply, Archive, Trash, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const emailsData = [
  {
    id: 1,
    from: "sarah.johnson@techsolutions.com",
    subject: "Re: Enterprise Software Proposal",
    preview: "Thank you for the detailed proposal. I have a few questions about the implementation timeline...",
    date: "2 hours ago",
    isRead: false,
    isStarred: true,
    contact: "Sarah Johnson",
    company: "Tech Solutions Inc."
  },
  {
    id: 2,
    from: "m.chen@designstudio.com",
    subject: "Meeting Follow-up",
    preview: "It was great meeting with you yesterday. As discussed, I'm attaching the requirements document...",
    date: "1 day ago",
    isRead: true,
    isStarred: false,
    contact: "Michael Chen",
    company: "Design Studio"
  },
  {
    id: 3,
    from: "emily@startup.co",
    subject: "Partnership Opportunity",
    preview: "We're interested in exploring a potential partnership with your company...",
    date: "3 days ago",
    isRead: true,
    isStarred: false,
    contact: "Emily Rodriguez",
    company: "Startup Co."
  },
];

const templateData = [
  {
    id: 1,
    name: "Welcome Email",
    subject: "Welcome to [Company Name]!",
    body: "Dear [Name],\n\nWelcome to our company! We're excited to work with you...",
    category: "Onboarding"
  },
  {
    id: 2,
    name: "Follow-up",
    subject: "Following up on our conversation",
    body: "Hi [Name],\n\nI wanted to follow up on our recent conversation about...",
    category: "Sales"
  },
  {
    id: 3,
    name: "Proposal",
    subject: "Proposal for [Project Name]",
    body: "Dear [Name],\n\nPlease find attached our proposal for your project...",
    category: "Sales"
  },
];

const Email = () => {
  const [emails, setEmails] = useState(emailsData);
  const [templates, setTemplates] = useState(templateData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const [newEmail, setNewEmail] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    template: ""
  });

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendEmail = () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.body) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Email sent successfully!",
    });

    setNewEmail({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      template: ""
    });
    setIsComposeOpen(false);
  };

  const handleUseTemplate = (template) => {
    setNewEmail({
      ...newEmail,
      subject: template.subject,
      body: template.body,
      template: template.name
    });
  };

  const markAsRead = (id) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, isRead: true } : email
    ));
  };

  const toggleStar = (id) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Email Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage your email communications and templates.</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Compose Email
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Email</DialogTitle>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cc">CC</Label>
                  <Input
                    id="cc"
                    value={newEmail.cc}
                    onChange={(e) => setNewEmail({...newEmail, cc: e.target.value})}
                    placeholder="cc@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="bcc">BCC</Label>
                  <Input
                    id="bcc"
                    value={newEmail.bcc}
                    onChange={(e) => setNewEmail({...newEmail, bcc: e.target.value})}
                    placeholder="bcc@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="template">Use Template</Label>
                <Select value={newEmail.template} onValueChange={(value) => {
                  const template = templates.find(t => t.name === value);
                  if (template) handleUseTemplate(template);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.name}>
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
                  placeholder="Email subject"
                />
              </div>
              <div>
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({...newEmail, body: e.target.value})}
                  placeholder="Type your message here..."
                  rows={8}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSendEmail} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{emails.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Unread</CardTitle>
            <Mail className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {emails.filter(e => !e.isRead).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Starred</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {emails.filter(e => e.isStarred).length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">12</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Email Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Inbox</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredEmails.map((email) => (
                  <div 
                    key={email.id} 
                    className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                      !email.isRead ? 'bg-blue-50/50' : ''
                    } ${selectedEmail?.id === email.id ? 'bg-blue-100' : ''}`}
                    onClick={() => {
                      setSelectedEmail(email);
                      markAsRead(email.id);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium truncate ${!email.isRead ? 'font-bold' : ''}`}>
                            {email.contact}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {email.company}
                          </Badge>
                          {email.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <div className={`text-sm truncate mb-1 ${!email.isRead ? 'font-semibold' : ''}`}>
                          {email.subject}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {email.preview}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {email.date}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(email.id);
                          }}
                        >
                          <Star className={`w-4 h-4 ${email.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Templates */}
        <div>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{template.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.subject}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 p-0 h-auto text-blue-600"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Detail View */}
      {selectedEmail && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selectedEmail.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  From: {selectedEmail.contact} &lt;{selectedEmail.from}&gt;
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
                <Button variant="outline" size="sm">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>{selectedEmail.preview}</p>
              <br />
              <p>This is a sample email content. In a real application, this would contain the full email body with proper formatting and attachments support.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Email;
