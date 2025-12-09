'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { getJWTToken } from '@/lib/jwt';
import { getMyOrders, type Order } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function OrdersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.user) return;

      try {
        const token = await getJWTToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const data = await getMyOrders(token);
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [session, router]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-2">View and track your past orders</p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order #{order.id}</CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className={`${statusColors[order.status]} text-white`}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {order.shippingAddress && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                        {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                      </div>
                    </div>
                  )}

                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" />
                        Status History
                      </h4>
                      <div className="space-y-2">
                        {order.statusHistory
                          .sort(
                            (a, b) =>
                              new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
                          )
                          .map((history) => (
                            <div key={history.id} className="flex items-start gap-2 text-sm">
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 ${statusColors[history.status] || 'bg-gray-400'}`}
                              />
                              <div>
                                <span className="font-medium capitalize">{history.status}</span>
                                <span className="text-muted-foreground ml-2">
                                  {new Date(history.changedAt).toLocaleString()}
                                </span>
                                {history.note && (
                                  <p className="text-muted-foreground">{history.note}</p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total Amount</span>
                    <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
