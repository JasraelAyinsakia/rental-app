import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active rentals count
    const activeRentals = await prisma.rental.count({
      where: { status: 'ACTIVE' },
    });

    // Get overdue rentals count (more than 10 days)
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

    // Calculate revenue for different periods
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

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

    const weeklyRevenue = await prisma.rental.aggregate({
      where: {
        status: 'RETURNED',
        returnDateTime: {
          gte: thisWeekStart,
        },
      },
      _sum: {
        totalCharge: true,
      },
    });

    const monthlyRevenue = await prisma.rental.aggregate({
      where: {
        status: 'RETURNED',
        returnDateTime: {
          gte: thisMonthStart,
        },
      },
      _sum: {
        totalCharge: true,
      },
    });

    return NextResponse.json({
      activeRentals,
      overdueRentals,
      dailyRevenue: dailyRevenue._sum.totalCharge || 0,
      weeklyRevenue: weeklyRevenue._sum.totalCharge || 0,
      monthlyRevenue: monthlyRevenue._sum.totalCharge || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

