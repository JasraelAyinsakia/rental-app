import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateRentalCharges } from '@/lib/rental-calculations';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rentalId = params.id;

    // Get rental with items
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: {
        items: {
          include: {
            mouldType: true,
          },
        },
      },
    });

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    if (rental.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Rental is not active' },
        { status: 400 }
      );
    }

    const returnDateTime = new Date(body.returnDateTime);

    // Calculate charges
    const calculation = calculateRentalCharges(
      rental.pickupDateTime,
      returnDateTime,
      rental.depositAmount,
      rental.dailyRate
    );

    // Update rental
    const updatedRental = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        returnDateTime,
        status: 'RETURNED',
        daysUsed: calculation.daysUsed,
        totalCharge: calculation.totalCharge,
        refundAmount: calculation.refundAmount,
        additionalPayment: calculation.additionalPayment,
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

    // Update mould availability for each item (increase back)
    for (const item of rental.items) {
      await prisma.mouldType.update({
        where: { id: item.mouldTypeId },
        data: {
          available: {
            increment: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(updatedRental);
  } catch (error) {
    console.error('Error returning rental:', error);
    return NextResponse.json(
      { error: 'Failed to process return' },
      { status: 500 }
    );
  }
}

