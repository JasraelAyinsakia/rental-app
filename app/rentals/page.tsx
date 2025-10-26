'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Rental {
  id: string;
  receiptNumber: string;
  customer: {
    fullName: string;
    contactNumber: string;
    ghanaCardId: string;
  };
  mouldType: {
    name: string;
  };
  pickupDateTime: string;
  returnDateTime: string | null;
  status: string;
  depositAmount: number;
  totalCharge: number | null;
}

export default function RentalsPage() {
  const { data: session } = useSession();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    filterRentals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentals, searchQuery, statusFilter]);

  const fetchRentals = async () => {
    try {
      const res = await fetch('/api/rentals');
      if (res.ok) {
        const data = await res.json();
        setRentals(data);
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRentals = () => {
    let filtered = [...rentals];

    if (statusFilter) {
      filtered = filtered.filter((rental) => rental.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rental) =>
          rental.customer.fullName.toLowerCase().includes(query) ||
          rental.customer.contactNumber.includes(query) ||
          rental.receiptNumber.toLowerCase().includes(query)
      );
    }

    setFilteredRentals(filtered);
  };

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

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout userName={session.user.name} userRole={session.user.role}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rentals</h1>
            <p className="text-muted-foreground">
              Manage all mould rentals and returns
            </p>
          </div>
          <Link href="/rentals/new">
            <Button className="gap-2">
              <Plus size={16} />
              New Rental
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              placeholder="Search by name, contact, or receipt number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="RETURNED">Returned</option>
            <option value="OVERDUE">Overdue</option>
          </Select>
        </div>

        <div className="border rounded-lg">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading rentals...
            </div>
          ) : filteredRentals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No rentals found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Mould Type</TableHead>
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell className="font-medium">
                      {rental.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {rental.customer.fullName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rental.customer.contactNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{rental.mouldType.name}</TableCell>
                    <TableCell>
                      {formatDateTime(rental.pickupDateTime)}
                    </TableCell>
                    <TableCell>{getStatusBadge(rental.status)}</TableCell>
                    <TableCell>{formatCurrency(rental.depositAmount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/rentals/${rental.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </Link>
                        {rental.status === 'ACTIVE' && (
                          <Link href={`/rentals/${rental.id}/return`}>
                            <Button variant="ghost" size="sm">
                              <CheckCircle size={16} />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

