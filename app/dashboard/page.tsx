import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Package, AlertTriangle, Plus, Eye, List, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

async function getStats() {
  try {
    // Fetch stats directly from the database instead of using fetch
    const activeRentals = await prisma.rental.count({
      where: { status: 'ACTIVE' },
    });

    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    
    const overdueRentals = await prisma.rental.count({
      where: {
        status: 'ACTIVE',
        pickupDateTime: {
          lt: tenDaysAgo,
        },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyRevenue = await prisma.rental.aggregate({
      where: {
        status: 'RETURNED',
        returnDateTime: {
          gte: today,
        },
      },
      _sum: {
        totalCharge: true,
      },
    });

    return {
      activeRentals,
      overdueRentals,
      dailyRevenue: dailyRevenue._sum.totalCharge || 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      activeRentals: 0,
      overdueRentals: 0,
      dailyRevenue: 0,
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const stats = await getStats();

  const statCards = [
    {
      title: 'Active Rentals',
      description: 'Currently rented out',
      value: stats.activeRentals,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Overdue Rentals',
      description: 'Need attention',
      value: stats.overdueRentals,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      bgLight: 'bg-red-50',
    },
    {
      title: "Today's Revenue",
      description: 'Earnings today',
      value: formatCurrency(stats.dailyRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      bgLight: 'bg-green-50',
    },
  ];

  return (
    <DashboardLayout userName={session.user.name} userRole={session.user.role}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {session.user.name}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Here&apos;s what&apos;s happening with your floor rental business today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-4xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Primary Action */}
          <Card className="border-2 border-primary shadow-lg hover:shadow-xl transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Rental
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Start a new floor mould rental transaction. Record customer details, 
                select moulds, and generate a receipt.
              </p>
              <Link href="/rentals/new">
                <Button className="w-full gap-2" size="lg">
                  New Rental
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Secondary Actions */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/rentals">
                <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold">View All Rentals</div>
                    <div className="text-xs text-muted-foreground">Manage active and past rentals</div>
                  </div>
                </Button>
              </Link>
              <Link href="/moulds">
                <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                  <List className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold">Floor Mould Inventory</div>
                    <div className="text-xs text-muted-foreground">Check stock and availability</div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

