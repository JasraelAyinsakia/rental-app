'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Edit, Save, X } from 'lucide-react';

interface MouldType {
  id: string;
  name: string;
  quantity: number;
  available: number;
}

export default function MouldsPage() {
  const { data: session } = useSession();
  const [moulds, setMoulds] = useState<MouldType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ quantity: number; available: number }>({
    quantity: 0,
    available: 0,
  });

  // Check if user can manage inventory
  const canManageInventory = session?.user.role === 'ADMIN' || 
    (session?.user.role === 'STAFF' && 
     (session.user as any).permissions?.canManageInventory);

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
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityBadge = (available: number, quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Not Set</Badge>;
    }
    
    const percentage = (available / quantity) * 100;
    
    if (percentage === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (percentage < 30) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  const handleEdit = (mould: MouldType) => {
    setEditingId(mould.id);
    setEditValues({
      quantity: mould.quantity,
      available: mould.available,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ quantity: 0, available: 0 });
  };

  const handleSave = async (mouldId: string) => {
    try {
      const res = await fetch(`/api/moulds/${mouldId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editValues),
      });

      if (res.ok) {
        fetchMoulds();
        setEditingId(null);
      } else {
        alert('Failed to update mould');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout userName={session.user.name} userRole={session.user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mould Inventory</h1>
          <p className="text-muted-foreground">
            Track availability of all mould types
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Mould Types
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moulds.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Currently Rented
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {moulds.reduce((sum, m) => sum + (m.quantity - m.available), 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {moulds.reduce((sum, m) => sum + m.available, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mould Types</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading moulds...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mould Name</TableHead>
                    <TableHead>Total Quantity</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Currently Rented</TableHead>
                    <TableHead>Status</TableHead>
                    {canManageInventory && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moulds.map((mould) => (
                    <TableRow key={mould.id}>
                      <TableCell className="font-medium">{mould.name}</TableCell>
                      <TableCell>
                        {editingId === mould.id ? (
                          <Input
                            type="number"
                            min="0"
                            value={editValues.quantity}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20"
                          />
                        ) : (
                          mould.quantity
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === mould.id ? (
                          <Input
                            type="number"
                            min="0"
                            max={editValues.quantity}
                            value={editValues.available}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                available: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20"
                          />
                        ) : (
                          mould.available
                        )}
                      </TableCell>
                      <TableCell>{mould.quantity - mould.available}</TableCell>
                      <TableCell>
                        {getAvailabilityBadge(mould.available, mould.quantity)}
                      </TableCell>
                      {canManageInventory && (
                        <TableCell className="text-right">
                          {editingId === mould.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSave(mould.id)}
                                className="gap-1"
                              >
                                <Save size={14} />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(mould)}
                            >
                              <Edit size={14} />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

