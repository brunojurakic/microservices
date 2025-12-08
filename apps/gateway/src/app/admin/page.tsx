'use client';

import { useEffect, useState } from 'react';
import { getProducts, getAllOrders, type Order } from '@/lib/api';
import { getJWTToken } from '@/lib/jwt';
import { Spinner } from '@/components/ui/spinner';

interface Stats {
  revenue: number;
  orderCount: number;
  productCount: number;
  userCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = await getJWTToken();
        if (!token) return;

        const [products, orders, statsResponse] = await Promise.all([
          getProducts(),
          getAllOrders(token),
          fetch('/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);

        const revenue = orders.reduce(
          (sum: number, order: Order) => sum + parseFloat(order.totalAmount),
          0
        );

        setStats({
          revenue,
          orderCount: orders.length,
          productCount: products.length,
          userCount: statsResponse.userCount || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome to the admin administration area.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
          <div className="text-2xl font-bold mt-2">${stats?.revenue.toFixed(2) || '0.00'}</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Orders</h3>
          <div className="text-2xl font-bold mt-2">{stats?.orderCount || 0}</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Products</h3>
          <div className="text-2xl font-bold mt-2">{stats?.productCount || 0}</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Users</h3>
          <div className="text-2xl font-bold mt-2">{stats?.userCount || 0}</div>
        </div>
      </div>
    </div>
  );
}
