'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Rental {
  id: string;
  receiptNumber: string;
  pickupDateTime: string;
  depositAmount: number;
  dailyRate: number;
  status: string;
  customer: {
    id: string;
    fullName: string;
    contactNumber: string;
    ghanaCardId: string;
    ghanaCardCollected: boolean;
  };
}

export default function EditRentalPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [rental, setRental] = useState<Rental | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    ghanaCardId: '',
    ghanaCardCollected: false,
    pickupDateTime: '',
    depositAmount: 1000,
    dailyRate: 100,
  });

  useEffect(() => {
    if (session?.user.role !== 'ADMIN') {
      router.push('/rentals');
      return;
    }
    fetchRental();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchRental = async () => {
    try {
      const res = await fetch(`/api/rentals/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRental(data);
        
        // Convert datetime for input
        const pickupDate = new Date(data.pickupDateTime);
        pickupDate.setMinutes(pickupDate.getMinutes() - pickupDate.getTimezoneOffset());
        const formattedDate = pickupDate.toISOString().slice(0, 16);

        setFormData({
          fullName: data.customer.fullName,
          contactNumber: data.customer.contactNumber,
          ghanaCardId: data.customer.ghanaCardId,
          ghanaCardCollected: data.customer.ghanaCardCollected,
          pickupDateTime: formattedDate,
          depositAmount: data.depositAmount,
          dailyRate: data.dailyRate,
        });
      }
    } catch (error) {
      console.error('Error fetching rental:', error);
      setError('Failed to load rental details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/rentals/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            contactNumber: formData.contactNumber,
            ghanaCardId: formData.ghanaCardId,
            ghanaCardCollected: formData.ghanaCardCollected,
          },
          pickupDateTime: formData.pickupDateTime,
          depositAmount: formData.depositAmount,
          dailyRate: formData.dailyRate,
        }),
      });

      if (res.ok) {
        router.push(`/rentals/${params.id}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update rental');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      ghanaCardCollected: checked,
    }));
  };

  if (!session) {
    return null;
  }

  if (fetching) {
    return (
      <DashboardLayout userName={session.user.name} userRole={session.user.role}>
        <div className="p-8 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!rental || rental.status !== 'ACTIVE') {
    return (
      <DashboardLayout userName={session.user.name} userRole={session.user.role}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">
            {!rental ? 'Rental Not Found' : 'Only active rentals can be edited'}
          </h1>
          <Link href="/rentals">
            <Button>Back to Rentals</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={session.user.name} userRole={session.user.role}>
      <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <Link href={`/rentals/${params.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Rental</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {rental.receiptNumber}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rental Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ghanaCardId">Ghana Card ID *</Label>
                  <Input
                    id="ghanaCardId"
                    name="ghanaCardId"
                    value={formData.ghanaCardId}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ghanaCardCollected"
                    checked={formData.ghanaCardCollected}
                    onChange={(e) => handleCheckboxChange(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="ghanaCardCollected" className="cursor-pointer">
                    Ghana Card physically collected as security
                  </Label>
                </div>
              </div>

              {/* Rental Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rental Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="pickupDateTime">Pickup Date & Time *</Label>
                  <Input
                    id="pickupDateTime"
                    name="pickupDateTime"
                    type="datetime-local"
                    value={formData.pickupDateTime}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="text-base"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="depositAmount">Deposit Amount (GHS) *</Label>
                    <Input
                      id="depositAmount"
                      name="depositAmount"
                      type="number"
                      step="0.01"
                      value={formData.depositAmount}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Daily Rate (GHS) *</Label>
                    <Input
                      id="dailyRate"
                      name="dailyRate"
                      type="number"
                      step="0.01"
                      value={formData.dailyRate}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href={`/rentals/${params.id}`} className="w-full sm:w-auto">
                  <Button type="button" variant="outline" disabled={loading} className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

