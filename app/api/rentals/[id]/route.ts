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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only ADMIN can edit rentals
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can edit rentals.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if rental exists
    const existingRental = await prisma.rental.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!existingRental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    // Only allow editing active rentals
    if (existingRental.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Only active rentals can be edited' },
        { status: 400 }
      );
    }

    // Update customer if customer details are provided
    if (body.customer) {
      await prisma.customer.update({
        where: { id: existingRental.customerId },
        data: {
          fullName: body.customer.fullName || existingRental.customer.fullName,
          contactNumber: body.customer.contactNumber || existingRental.customer.contactNumber,
          ghanaCardId: body.customer.ghanaCardId || existingRental.customer.ghanaCardId,
          ghanaCardCollected: body.customer.ghanaCardCollected ?? existingRental.customer.ghanaCardCollected,
        },
      });
    }

    // Update rental details
    const updateData: any = {};

    if (body.pickupDateTime) {
      updateData.pickupDateTime = new Date(body.pickupDateTime);
    }

    if (body.depositAmount !== undefined) {
      updateData.depositAmount = body.depositAmount;
    }

    if (body.dailyRate !== undefined) {
      updateData.dailyRate = body.dailyRate;
    }

    const rental = await prisma.rental.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: {
            mouldType: true,
          },
        },
      },
    });

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Error updating rental:', error);
    return NextResponse.json(
      { error: 'Failed to update rental' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only ADMIN can delete rentals
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can delete rentals.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Get rental details before deleting to restore inventory
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!rental) {
      return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
    }

    // If rental is active, restore inventory
    if (rental.status === 'ACTIVE') {
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
    }

    // Delete rental (this will cascade delete rental items)
    await prisma.rental.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rental:', error);
    return NextResponse.json(
      { error: 'Failed to delete rental' },
      { status: 500 }
    );
  }
}
