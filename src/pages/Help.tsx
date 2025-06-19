
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Book, Users, HelpCircle, Mail, Plus } from "lucide-react";

const Help = () => {
  const faqData = [
    {
      question: "How do I schedule a new appointment?",
      answer: "Click the 'New Appointment' button in the appointments section, fill in the client details, select a service and staff member, then choose the date and time."
    },
    {
      question: "Can I reschedule appointments?",
      answer: "Yes, you can drag and drop appointments in the calendar view to reschedule them to different times or assign them to different staff members."
    },
    {
      question: "How do I add a new client?",
      answer: "Go to the Clients section and click 'Add New Client'. Fill in their contact information, preferences, and any notes about their service history."
    },
    {
      question: "How do I manage staff schedules?",
      answer: "In the Staff section, you can set working hours, breaks, and availability for each team member. This affects when appointments can be scheduled."
    },
    {
      question: "Can I track inventory?",
      answer: "Yes, the Inventory section allows you to track products, supplies, and their usage across different services."
    }
  ];

  const quickLinks = [
    { title: "Getting Started Guide", icon: Book, description: "Learn the basics of using Aura Platform" },
    { title: "Staff Management", icon: Users, description: "How to manage your team and schedules" },
    { title: "Booking System", icon: HelpCircle, description: "Master the appointment calendar" },
    { title: "Contact Support", icon: Mail, description: "Get help from our support team" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-1">Get help with Aura Platform and find answers to common questions.</p>
        </div>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((link, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center mb-2">
                <link.icon className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-lg">{link.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">{link.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Help Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                <CardTitle>Frequently Asked Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-600" />
                <CardTitle>Contact Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="What can we help you with?" />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    className="w-full p-3 border rounded-md resize-none"
                    rows={4}
                    placeholder="Describe your issue or question..."
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Support Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Response Time</span>
                <Badge variant="secondary">< 2 hours</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction</span>
                <Badge variant="secondary">98%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Resolution Rate</span>
                <Badge variant="secondary">99.5%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Resources */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Book className="w-6 h-6 text-teal-600" />
              <span>User Guide</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="w-6 h-6 text-teal-600" />
              <span>Video Tutorials</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <HelpCircle className="w-6 h-6 text-teal-600" />
              <span>Community Forum</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Mail className="w-6 h-6 text-teal-600" />
              <span>Knowledge Base</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
