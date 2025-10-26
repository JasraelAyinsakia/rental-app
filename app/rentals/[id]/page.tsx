import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default async function RentalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      mouldType: true,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!rental) {
    return (
      <DashboardLayout userName={session.user.name} userRole={session.user.role}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Rental Not Found</h1>
          <Link href="/rentals">
            <Button>Back to Rentals</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning'> = {
      ACTIVE: 'default',
      RETURNED: 'success',
      OVERDUE: 'warning',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout userName={session.user.name} userRole={session.user.role}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/rentals">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Rental Details</h1>
              <p className="text-muted-foreground">{rental.receiptNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {rental.status === 'ACTIVE' && (
              <Link href={`/rentals/${rental.id}/return`}>
                <Button className="gap-2">
                  <CheckCircle size={16} />
                  Process Return
                </Button>
              </Link>
            )}
            <Link href={`/rentals/${rental.id}/receipt`}>
              <Button variant="outline" className="gap-2">
                <Printer size={16} />
                Print Receipt
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Full Name</div>
                <div className="font-medium">{rental.customer.fullName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Contact Number</div>
                <div className="font-medium">{rental.customer.contactNumber}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ghana Card ID</div>
                <div className="font-medium">{rental.customer.ghanaCardId}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Ghana Card Collected
                </div>
                <div className="font-medium">
                  {rental.customer.ghanaCardCollected ? (
                    <Badge variant="success">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                  {rental.customer.ghanaCardCollectedDate && (
                    <span className="text-sm ml-2">
                      on {formatDateTime(rental.customer.ghanaCardCollectedDate)}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rental Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Mould Type</div>
                <div className="font-medium">{rental.mouldType.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div>{getStatusBadge(rental.status)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pickup Date & Time</div>
                <div className="font-medium">
                  {formatDateTime(rental.pickupDateTime)}
                </div>
              </div>
              {rental.returnDateTime && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Return Date & Time
                  </div>
                  <div className="font-medium">
                    {formatDateTime(rental.returnDateTime)}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Created By</div>
                <div className="font-medium">{rental.createdBy.name}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Deposit Amount</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(rental.depositAmount)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Daily Rate</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(rental.dailyRate)}
                </div>
              </div>
              {rental.status === 'RETURNED' && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Days Used</div>
                    <div className="text-2xl font-bold">{rental.daysUsed}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Charge</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(rental.totalCharge || 0)}
                    </div>
                  </div>
                  {rental.refundAmount && rental.refundAmount > 0 ? (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Refund Amount
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(rental.refundAmount)}
                      </div>
                    </div>
                  ) : null}
                  {rental.additionalPayment && rental.additionalPayment > 0 ? (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Additional Payment
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(rental.additionalPayment)}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

