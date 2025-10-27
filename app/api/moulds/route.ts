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

    const moulds = await prisma.mouldType.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(moulds);
  } catch (error) {
    console.error('Error fetching moulds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moulds' },
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

    // Check permissions - only ADMIN or STAFF with canManageInventory
    if (
      session.user.role !== 'ADMIN' &&
      !(session.user.role === 'STAFF' && (session.user as any).permissions?.canManageInventory)
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to add mould types' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, quantity, available } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Mould type name is required' },
        { status: 400 }
      );
    }

    // Check if mould type already exists
    const existingMould = await prisma.mouldType.findUnique({
      where: { name: name.trim() },
    });

    if (existingMould) {
      return NextResponse.json(
        { error: 'A mould type with this name already exists' },
        { status: 400 }
      );
    }

    const mould = await prisma.mouldType.create({
      data: {
        name: name.trim(),
        quantity: quantity || 0,
        available: available || 0,
      },
    });

    return NextResponse.json(mould);
  } catch (error) {
    console.error('Error creating mould type:', error);
    return NextResponse.json(
      { error: 'Failed to create mould type' },
      { status: 500 }
    );
  }
}

