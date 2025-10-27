'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

export function ReceiptActions({ rentalId }: { rentalId: string }) {
  return (
    <div className="max-w-4xl mx-auto mb-4 no-print flex justify-between">
      <Link href={`/rentals/${rentalId}`}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeft size={16} />
          Back
        </Button>
      </Link>
      <Button onClick={() => window.print()} className="gap-2">
        <Printer size={16} />
        Print Receipt
      </Button>
    </div>
  );
}

