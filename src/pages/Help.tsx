
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { help-circle, search, mail, book, users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const faqData = [
  {
    id: 1,
    question: "How do I add a new contact to the CRM?",
    answer: "To add a new contact, navigate to the Contacts page and click the 'Add Contact' button. Fill in the required information including name, email, phone, and company details. Click 'Add Contact' to save.",
    category: "Contacts"
  },
  {
    id: 2,
    question: "How can I track my sales pipeline?",
    answer: "Use the Deals page to track your sales pipeline. You can view deals by stage, filter by various criteria, and update deal progress. The dashboard also provides a visual overview of your pipeline.",
    category: "Sales"
  },
  {
    id: 3,
    question: "Can I send emails directly from the CRM?",
    answer: "Yes! The Email Center allows you to compose and send emails directly from the CRM. You can also use email templates and track email history with your contacts.",
    category: "Email"
  },
  {
    id: 4,
    question: "How do I assign tasks to team members?",
    answer: "In the Tasks section, create a new task and use the 'Assigned To' dropdown to select a team member. You can also set due dates, priorities, and link tasks to specific contacts or deals.",
    category: "Tasks"
  },
  {
    id: 5,
    question: "Where can I view sales reports?",
    answer: "The Reports & Analytics page provides comprehensive sales reports, performance metrics, and visual charts. You can filter by date ranges and export reports for external use.",
    category: "Reports"
  },
  {
    id: 6,
    question: "How do I manage user permissions?",
    answer: "Go to User Management to add users, assign roles, and manage permissions. Different roles have different access levels to various parts of the CRM system.",
    category: "Users"
  }
];

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [supportTicket, setSupportTicket] = useState({
    name: "",
    email: "",
    subject: "",
    category: "General",
    priority: "Medium",
    description: ""
  });

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!supportTicket.name || !supportTicket.email || !supportTicket.subject || !supportTicket.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simulate ticket submission
    toast({
      title: "Success",
      description: "Support ticket submitted successfully! We'll get back to you within 24 hours.",
    });

    setSupportTicket({
      name: "",
      email: "",
      subject: "",
      category: "General",
      priority: "Medium",
      description: ""
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Contacts': return 'bg-blue-100 text-blue-800';
      case 'Sales': return 'bg-green-100 text-green-800';
      case 'Email': return 'bg-purple-100 text-purple-800';
      case 'Tasks': return 'bg-orange-100 text-orange-800';
      case 'Reports': return 'bg-red-100 text-red-800';
      case 'Users': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-1">Find answers to common questions and get assistance with using Aura CRM.</p>
        </div>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <book className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <CardTitle className="text-blue-900">Getting Started Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-blue-700 text-sm">Learn the basics of using Aura CRM effectively</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <CardTitle className="text-green-900">Video Tutorials</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-700 text-sm">Watch step-by-step video tutorials for key features</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <help-circle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <CardTitle className="text-purple-900">Live Chat Support</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-purple-700 text-sm">Get instant help from our support team</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Frequently Asked Questions</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFAQs.map((faq) => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge className={getCategoryColor(faq.category)}>
                      {faq.category}
                    </Badge>
                    <span className="text-left">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-2 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {filteredFAQs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <help-circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No FAQs found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <mail className="w-5 h-5" />
            Contact Support
          </CardTitle>
          <p className="text-muted-foreground">Can't find what you're looking for? Submit a support ticket and we'll help you out.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supportName">Full Name *</Label>
              <Input
                id="supportName"
                value={supportTicket.name}
                onChange={(e) => setSupportTicket({...supportTicket, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Email Address *</Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportTicket.email}
                onChange={(e) => setSupportTicket({...supportTicket, email: e.target.value})}
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <Label htmlFor="supportCategory">Category</Label>
              <Select value={supportTicket.category} onValueChange={(value) => setSupportTicket({...supportTicket, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General Question</SelectItem>
                  <SelectItem value="Technical">Technical Issue</SelectItem>
                  <SelectItem value="Billing">Billing & Account</SelectItem>
                  <SelectItem value="Feature">Feature Request</SelectItem>
                  <SelectItem value="Training">Training & Onboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supportPriority">Priority</Label>
              <Select value={supportTicket.priority} onValueChange={(value) => setSupportTicket({...supportTicket, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="supportSubject">Subject *</Label>
            <Input
              id="supportSubject"
              value={supportTicket.subject}
              onChange={(e) => setSupportTicket({...supportTicket, subject: e.target.value})}
              placeholder="Brief description of your issue"
            />
          </div>
          <div>
            <Label htmlFor="supportDescription">Description *</Label>
            <Textarea
              id="supportDescription"
              value={supportTicket.description}
              onChange={(e) => setSupportTicket({...supportTicket, description: e.target.value})}
              placeholder="Please provide detailed information about your question or issue..."
              rows={6}
            />
          </div>
          <Button 
            onClick={handleSubmitTicket}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Submit Support Ticket
          </Button>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col gap-2">
              <book className="w-5 h-5" />
              <span className="text-sm">Documentation</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-2">
              <users className="w-5 h-5" />
              <span className="text-sm">Community Forum</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-2">
              <help-circle className="w-5 h-5" />
              <span className="text-sm">Training Sessions</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-2">
              <mail className="w-5 h-5" />
              <span className="text-sm">Email Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
