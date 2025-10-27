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
    
    // Validate required fields
    if (!body.fullName || !body.contactNumber || !body.ghanaCardId) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      );
    }

    if (!body.pickupDateTime) {
      return NextResponse.json(
        { error: 'Pickup date and time is required' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one mould type must be selected' },
        { status: 400 }
      );
    }

    // Validate mould availability
    for (const item of body.items) {
      const mould = await prisma.mouldType.findUnique({
        where: { id: item.mouldTypeId },
      });

      if (!mould) {
        return NextResponse.json(
          { error: `Mould type not found` },
          { status: 404 }
        );
      }

      if (mould.available < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient quantity available for ${mould.name}. Only ${mould.available} available.` },
          { status: 400 }
        );
      }
    }
    
    // Generate receipt number - find the highest existing number and increment
    const allRentals = await prisma.rental.findMany({
      select: {
        receiptNumber: true,
      },
    });

    let receiptNumber: string = '';
    let receiptExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (receiptExists && attempts < maxAttempts) {
      if (allRentals.length === 0 && attempts === 0) {
        // First rental
        receiptNumber = 'MRT-000001';
      } else {
        // Extract all numbers and find the maximum
        const numbers = allRentals
          .map(r => {
            const parts = r.receiptNumber.split('-');
            return parseInt(parts[1]) || 0;
          })
          .filter(n => !isNaN(n));
        
        const maxNumber = Math.max(...numbers, 0);
        receiptNumber = `MRT-${String(maxNumber + 1 + attempts).padStart(6, '0')}`;
      }

      // Check if this receipt number already exists
      const existing = await prisma.rental.findUnique({
        where: { receiptNumber },
      });

      if (!existing) {
        receiptExists = false;
      } else {
        attempts++;
        // If it exists, add it to our list and try again
        allRentals.push({ receiptNumber });
      }
    }

    if (receiptExists || !receiptNumber) {
      return NextResponse.json(
        { error: 'Unable to generate unique receipt number. Please try again.' },
        { status: 500 }
      );
    }

    // Check if customer exists or create new
    let customer = await prisma.customer.findFirst({
      where: {
        ghanaCardId: body.ghanaCardId,
      },
    });

    if (customer) {
      // Update existing customer with latest information
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          fullName: body.fullName,
          contactNumber: body.contactNumber,
          ghanaCardCollected: body.ghanaCardCollected,
          ghanaCardCollectedDate: body.ghanaCardCollected 
            ? new Date() 
            : (customer.ghanaCardCollected ? customer.ghanaCardCollectedDate : null),
        },
      });
    } else {
      // Create new customer
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
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to create rental';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

