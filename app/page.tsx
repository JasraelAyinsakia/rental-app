import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Shield, TrendingUp, Clock, CheckCircle, BarChart3 } from 'lucide-react';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Track all your floor mould types and availability in real-time',
    },
    {
      icon: Clock,
      title: 'Rental Tracking',
      description: 'Monitor active rentals, pickup times, and overdue returns effortlessly',
    },
    {
      icon: TrendingUp,
      title: 'Revenue Insights',
      description: 'View daily, weekly, and monthly revenue with automatic calculations',
    },
    {
      icon: Shield,
      title: 'Customer Records',
      description: 'Securely manage customer information and Ghana Card collection',
    },
    {
      icon: CheckCircle,
      title: 'Auto Calculations',
      description: 'Automatic charge calculations excluding Sundays, deposits, and refunds',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Generate detailed reports and track business performance',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Floor Masters</h1>
              <p className="text-xs text-gray-600">Tracking System</p>
            </div>
          </div>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4">
            <Package className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Floor Masters<br />
            <span className="text-primary">Tracking System</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your floor mould rental business with powerful tracking, 
            automated calculations, and comprehensive inventory management.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Rentals
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built specifically for floor mould rental businesses in Ghana, 
            with features designed to save you time and increase efficiency.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto bg-primary text-primary-foreground border-0">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join businesses across Ghana using Floor Masters to streamline 
              their rental operations and grow their business.
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Sign In to Your Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Floor Masters Tracking System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

