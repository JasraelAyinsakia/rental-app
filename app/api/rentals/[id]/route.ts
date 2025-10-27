import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            mouldType: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Error fetching rental:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental' },
      { status: 500 }
    );
  }
}

