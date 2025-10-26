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

