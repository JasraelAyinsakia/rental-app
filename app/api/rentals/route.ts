import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          customer: {
            fullName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          customer: {
            contactNumber: {
              contains: search,
            },
          },
        },
        {
          receiptNumber: {
            contains: search,
          },
        },
      ];
    }

    const rentals = await prisma.rental.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rentals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Generate receipt number
    const count = await prisma.rental.count();
    const receiptNumber = `MRT-${String(count + 1).padStart(6, '0')}`;

    // Check if customer exists or create new
    let customer = await prisma.customer.findFirst({
      where: {
        ghanaCardId: body.ghanaCardId,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: body.fullName,
          contactNumber: body.contactNumber,
          ghanaCardId: body.ghanaCardId,
          ghanaCardCollected: body.ghanaCardCollected,
          ghanaCardCollectedDate: body.ghanaCardCollected 
            ? new Date() 
            : null,
        },
      });
    }

    // Create rental with items
    const rental = await prisma.rental.create({
      data: {
        receiptNumber,
        customerId: customer.id,
        depositAmount: body.depositAmount || 1000,
        dailyRate: body.dailyRate || 100,
        pickupDateTime: new Date(body.pickupDateTime),
        createdById: session.user.id,
        items: {
          create: body.items.map((item: { mouldTypeId: string; quantity: number }) => ({
            mouldTypeId: item.mouldTypeId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            mouldType: true,
          },
        },
      },
    });

    // Update mould availability for each item (decrease)
    for (const item of body.items) {
      await prisma.mouldType.update({
        where: { id: item.mouldTypeId },
        data: {
          available: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json(
      { error: 'Failed to create rental' },
      { status: 500 }
    );
  }
}

