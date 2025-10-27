import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ReceiptActions } from './receipt-actions';

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
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
        },
      },
    },
  });

  if (!rental) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
          <Link href="/rentals">
            <Button>Back to Rentals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Floor Masters Crete System';
  const companyAddress = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Accra, Ghana';
  const companyContact = process.env.NEXT_PUBLIC_COMPANY_CONTACT || '+233553618426';
  const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'simonziyaba@gmail.com';

  const isReturnReceipt = rental.status === 'RETURNED';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Action Buttons */}
      <ReceiptActions rentalId={rental.id} />

      {/* Receipt */}
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg print:shadow-none">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
          <p className="text-sm text-gray-600">{companyAddress}</p>
          <p className="text-sm text-gray-600">
            Tel: {companyContact} | Email: {companyEmail}
          </p>
        </div>

        {/* Receipt Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">
            {isReturnReceipt ? 'RETURN RECEIPT' : 'RENTAL RECEIPT'}
          </h2>
          <p className="text-lg font-semibold text-gray-700 mt-2">
            Receipt #: {rental.receiptNumber}
          </p>
          <p className="text-sm text-gray-600">
            Date: {formatDateTime(rental.createdAt)}
          </p>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            Customer Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name:</p>
              <p className="font-medium">{rental.customer.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact:</p>
              <p className="font-medium">{rental.customer.contactNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ghana Card ID:</p>
              <p className="font-medium">{rental.customer.ghanaCardId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Card Collected:</p>
              <p className="font-medium">
                {rental.customer.ghanaCardCollected ? 'Yes' : 'No'}
                {rental.customer.ghanaCardCollectedDate && (
                  <span className="text-sm text-gray-600">
                    {' '}(on {formatDateTime(rental.customer.ghanaCardCollectedDate)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Rental Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            Rental Details
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Mould(s) Rented:</span>
              <div className="ml-4 mt-1 space-y-1">
                {rental.items.map((item) => (
                  <div key={item.id} className="font-medium">
                    {item.mouldType.name} × {item.quantity}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pickup Date & Time:</span>
              <span className="font-medium">
                {formatDateTime(rental.pickupDateTime)}
              </span>
            </div>
            {isReturnReceipt && rental.returnDateTime && (
              <div className="flex justify-between">
                <span className="text-gray-600">Return Date & Time:</span>
                <span className="font-medium">
                  {formatDateTime(rental.returnDateTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">
            Payment Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Deposit Amount:</span>
              <span className="font-medium">
                {formatCurrency(rental.depositAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Rate:</span>
              <span className="font-medium">
                {formatCurrency(rental.dailyRate)}
              </span>
            </div>
            
            {isReturnReceipt && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Used:</span>
                  <span className="font-medium">{rental.daysUsed} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Charge:</span>
                  <span className="font-medium">
                    {formatCurrency(rental.totalCharge || 0)}
                  </span>
                </div>
                
                <div className="border-t-2 border-gray-800 pt-2 mt-4">
                  {rental.refundAmount && rental.refundAmount > 0 ? (
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Refund Amount:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(rental.refundAmount)}
                      </span>
                    </div>
                  ) : null}
                  
                  {rental.additionalPayment && rental.additionalPayment > 0 ? (
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Additional Payment:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(rental.additionalPayment)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="mb-6 text-xs text-gray-600">
          <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Deposit: GHS 1,000 required at time of rental</li>
            <li>Daily rental fee: GHS 100 per day</li>
            <li>Pickup before 12pm: that day counts for charging</li>
            <li>Pickup after 12pm: charging starts the next day</li>
            <li>Return before 12pm: that day is not charged</li>
            <li>Return after 12pm: that day is charged</li>
            <li>Sundays are not counted or charged</li>
            <li>Customer is responsible for any damage to the mould</li>
          </ul>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t-2">
          <div>
            <div className="border-b border-gray-400 mb-2 h-12"></div>
            <p className="text-sm text-center">Customer Signature</p>
          </div>
          <div>
            <div className="border-b border-gray-400 mb-2 h-12"></div>
            <p className="text-sm text-center">
              Authorized Signature<br />
              <span className="text-xs text-gray-600">({rental.createdBy.name})</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t text-sm text-gray-600">
          <p>Thank you for your business!</p>
          <p className="text-xs mt-2">
            This is a computer-generated receipt. Please keep for your records.
          </p>
        </div>
      </div>
    </div>
  );
}

