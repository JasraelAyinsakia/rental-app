import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = params.id;

    const rentals = await prisma.rental.findMany({
      where: {
        customerId,
      },
      include: {
        mouldType: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Error fetching customer history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer history' },
      { status: 500 }
    );
  }
}

