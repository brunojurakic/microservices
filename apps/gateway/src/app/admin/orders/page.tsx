'use client';

import { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, type Order } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getJWTToken } from '@/lib/jwt';
import { Spinner } from '@/components/ui/spinner';
import { Select } from '@/components/ui/select';

const statusOptions = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const token = await getJWTToken();
        if (token) {
          const data = await getAllOrders(token);
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = await getJWTToken();
      if (!token) return;

      const updatedOrder = await updateOrderStatus(token, orderId, newStatus);

      setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <Badge variant="secondary">{orders.length} total</Badge>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Update Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {order.userId.substring(0, 8)}...
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${statusColors[order.status]} text-white`}>
                    {order.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updatingId === order.id}
                    className="w-32"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
