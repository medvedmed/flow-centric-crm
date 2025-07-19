
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scissors, Calendar, Users, BarChart3, Star, ArrowRight, CheckCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StaffLoginButton } from '@/components/StaffLoginButton';

export default function Landing() {
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent appointment booking with conflict detection and automated reminders"
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Comprehensive client profiles with visit history and preferences"
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Real-time insights into your salon's performance and growth metrics"
    },
    {
      icon: Star,
      title: "Staff Performance",
      description: "Track and optimize your team's productivity and customer satisfaction"
    }
  ];

  const benefits = [
    "Reduce no-shows by up to 40% with automated reminders",
    "Increase booking efficiency by 60% with smart scheduling",
    "Improve client retention through personalized service tracking",
    "Boost revenue with data-driven business insights",
    "Streamline operations with integrated inventory management"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-teal-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Aura Platform
              </span>
            </div>
            <div className="flex items-center gap-4">
              <StaffLoginButton />
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-teal-100 text-teal-800 border-teal-200">
            Professional Salon Management
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Transform Your Salon
            </span>
            <br />
            <span className="text-gray-900">Into a Digital Powerhouse</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline appointments, manage clients, track performance, and grow your beauty business 
            with our comprehensive salon management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-teal-200">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Salon
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for beauty professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/70 border-teal-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Proven Results for Salon Owners
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of salon owners who have transformed their business operations 
                and increased profitability with our platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">30</div>
                  <div className="text-sm opacity-90">Day Free Trial</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm opacity-90">Support</div>
                </div>
              </div>
              <Link to="/auth">
                <Button size="lg" className="w-full bg-white text-teal-600 hover:bg-gray-50">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Join the Future of Salon Management
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Transform your salon operations today and see immediate results in efficiency and profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-50">
                Get Started Now
              </Button>
            </Link>
            <StaffLoginButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-600 rounded flex items-center justify-center">
              <Scissors className="w-3 h-3 text-white" />
            </div>
            <span className="text-lg font-semibold">Aura Platform</span>
          </div>
          <p className="text-gray-400">
            © 2024 Aura Platform. Empowering beauty professionals worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
