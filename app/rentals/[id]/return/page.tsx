'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Calculator } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { calculateRentalCharges } from '@/lib/rental-calculations';

interface Rental {
  id: string;
  receiptNumber: string;
  customer: {
    fullName: string;
    contactNumber: string;
  };
  items: {
    mouldType: {
      name: string;
    };
    quantity: number;
  }[];
  pickupDateTime: string;
  depositAmount: number;
  dailyRate: number;
}

interface Calculation {
  daysUsed: number;
  totalCharge: number;
  refundAmount: number;
  additionalPayment: number;
}

export default function ReturnRentalPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [rental, setRental] = useState<Rental | null>(null);
  const [returnDateTime, setReturnDateTime] = useState('');
  const [calculation, setCalculation] = useState<Calculation | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRental();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (returnDateTime && rental) {
      calculateCharges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnDateTime, rental]);

  const fetchRental = async () => {
    try {
      const res = await fetch(`/api/rentals/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRental(data);
        // Set default return time to now
        const now = new Date();
        const formatted = now.toISOString().slice(0, 16);
        setReturnDateTime(formatted);
      } else {
        console.error('Failed to fetch rental');
      }
    } catch (error) {
      console.error('Error fetching rental:', error);
    }
  };

  const calculateCharges = () => {
    if (!rental || !returnDateTime) return;

    const result = calculateRentalCharges(
      new Date(rental.pickupDateTime),
      new Date(returnDateTime),
      rental.depositAmount,
      rental.dailyRate
    );

    setCalculation(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/rentals/${params.id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returnDateTime }),
      });

      if (res.ok) {
        router.push(`/rentals/${params.id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to process return');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading rental...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userName={session.user.name} userRole={session.user.role}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href={`/rentals/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Process Return</h1>
            <p className="text-muted-foreground">{rental.receiptNumber}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rental Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Customer</div>
                <div className="font-medium">{rental.customer.fullName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Mould Type(s)</div>
                <div className="space-y-1">
                  {rental.items.map((item, idx) => (
                    <div key={idx} className="font-medium">
                      {item.mouldType.name} × {item.quantity}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pickup Date</div>
                <div className="font-medium">
                  {formatDateTime(rental.pickupDateTime)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Deposit</div>
                <div className="font-medium">
                  {formatCurrency(rental.depositAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Return Information</CardTitle>
            <CardDescription>
              Select the return date and time to calculate charges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="returnDateTime">Return Date & Time *</Label>
                <Input
                  id="returnDateTime"
                  type="datetime-local"
                  value={returnDateTime}
                  onChange={(e) => setReturnDateTime(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {calculation && (
                <div className="p-4 border rounded-lg bg-accent/50 space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <Calculator size={20} />
                    <span>Calculated Charges</span>
                  </div>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Days Used (excluding Sundays)
                      </div>
                      <div className="text-xl font-bold">
                        {calculation.daysUsed} days
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Total Charge
                      </div>
                      <div className="text-xl font-bold">
                        {formatCurrency(calculation.totalCharge)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    {calculation.refundAmount > 0 ? (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Refund to Customer
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(calculation.refundAmount)}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Additional Payment Required
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(calculation.additionalPayment)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Usage exceeded 10 days (deposit amount)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm Return'}
                </Button>
                <Link href={`/rentals/${params.id}`}>
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Charging Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Pickup before 12pm: that day is charged</li>
              <li>• Pickup after 12pm: charging starts next day</li>
              <li>• Return before 12pm: that day is NOT charged</li>
              <li>• Return after 12pm: that day IS charged</li>
              <li>• Sundays are NOT counted or charged</li>
              <li>• Daily rate: {formatCurrency(rental.dailyRate)}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

