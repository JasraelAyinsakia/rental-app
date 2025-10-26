'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface MouldType {
  id: string;
  name: string;
  available: number;
}

interface MouldItem {
  mouldTypeId: string;
  quantity: number;
}

export default function NewRentalPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [moulds, setMoulds] = useState<MouldType[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    ghanaCardId: '',
    ghanaCardCollected: false,
    pickupDateTime: '',
    depositAmount: 1000,
    dailyRate: 100,
  });

  const [mouldItems, setMouldItems] = useState<MouldItem[]>([
    { mouldTypeId: '', quantity: 1 }
  ]);

  useEffect(() => {
    fetchMoulds();
  }, []);

  const fetchMoulds = async () => {
    try {
      const res = await fetch('/api/moulds');
      if (res.ok) {
        const data = await res.json();
        setMoulds(data);
      }
    } catch (error) {
      console.error('Error fetching moulds:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate at least one mould is selected
    const validItems = mouldItems.filter(item => item.mouldTypeId !== '');
    if (validItems.length === 0) {
      setError('Please select at least one mould type');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: validItems,
        }),
      });

      if (res.ok) {
        const rental = await res.json();
        router.push(`/rentals/${rental.id}/receipt`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create rental');
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

  const addMouldItem = () => {
    setMouldItems([...mouldItems, { mouldTypeId: '', quantity: 1 }]);
  };

  const removeMouldItem = (index: number) => {
    if (mouldItems.length > 1) {
      setMouldItems(mouldItems.filter((_, i) => i !== index));
    }
  };

  const updateMouldItem = (index: number, field: keyof MouldItem, value: string | number) => {
    const updated = [...mouldItems];
    updated[index] = { ...updated[index], [field]: value };
    setMouldItems(updated);
  };

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout userName={session.user.name} userRole={session.user.role}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href="/rentals">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">New Rental</h1>
            <p className="text-muted-foreground">
              Create a new mould rental record
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rental Information</CardTitle>
            <CardDescription>
              Fill in the customer and mould details below
            </CardDescription>
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

              {/* Mould Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Moulds to Rent</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMouldItem}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Add Mould
                  </Button>
                </div>

                <div className="space-y-3">
                  {mouldItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Mould Type *</Label>
                        <Select
                          value={item.mouldTypeId}
                          onChange={(e) => updateMouldItem(index, 'mouldTypeId', e.target.value)}
                          required
                          disabled={loading}
                        >
                          <option value="">Select mould type</option>
                          {moulds.map((mould) => (
                            <option key={mould.id} value={mould.id}>
                              {mould.name} (Available: {mould.available})
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="w-24 space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateMouldItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          required
                          disabled={loading}
                        />
                      </div>

                      {mouldItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMouldItem(index)}
                          disabled={loading}
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Rental'}
                </Button>
                <Link href="/rentals">
                  <Button type="button" variant="outline" disabled={loading}>
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
