import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to manage inventory
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, permissions: true },
    });

    const canManageInventory = user?.role === 'ADMIN' || 
      (user?.role === 'STAFF' && (user.permissions as any)?.canManageInventory);

    if (!canManageInventory) {
      return NextResponse.json({ error: 'No permission to manage inventory' }, { status: 403 });
    }

    const body = await request.json();
    const { id: mouldId } = await params;

    const mould = await prisma.mouldType.update({
      where: { id: mouldId },
      data: {
        quantity: body.quantity,
        available: body.available,
      },
    });

    return NextResponse.json(mould);
  } catch (error) {
    console.error('Error updating mould:', error);
    return NextResponse.json(
      { error: 'Failed to update mould' },
      { status: 500 }
    );
  }
}

