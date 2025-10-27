import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Plus, Eye, ArrowRight, Cuboid } from 'lucide-react';
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
        <div className="grid gap-6 md:grid-cols-2">
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

        {/* Quick Actions - Redesigned */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Create New Rental */}
          <Link href="/rentals/new">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 text-white h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Plus className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Create New Rental</h3>
                  <p className="text-sm text-blue-50">
                    Start a new floor mould rental transaction
                  </p>
                </div>
                <Button variant="secondary" className="gap-2 mt-auto">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* View Rentals */}
          <Link href="/rentals">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <Eye className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">View Rentals</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage active and past rental records
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Mould Inventory */}
          <Link href="/moulds">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
                <div className="p-4 bg-green-50 rounded-2xl">
                  <Cuboid className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Mould Inventory</h3>
                  <p className="text-sm text-muted-foreground">
                    Check stock levels and availability
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

