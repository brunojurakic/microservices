'use client';

import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession, signOut } from '@/lib/auth-client';
import { getJWTToken } from '@/lib/jwt';
import { useEffect, useState } from 'react';

export function Header() {
  const { data: session, isPending } = useSession();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  useEffect(() => {
    async function fetchCartCount() {
      if (session?.user) {
        try {
          setIsLoadingCart(true);
          const token = await getJWTToken();
          if (token) {
            const CART_SERVICE_URL =
              process.env.NEXT_PUBLIC_CART_SERVICE_URL || 'http://localhost:3002';
            const res = await fetch(`${CART_SERVICE_URL}/cart`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              const cartData = await res.json();
              const totalItems = cartData.items.reduce(
                (sum: number, item: { quantity: number }) => sum + item.quantity,
                0
              );
              setCartItemCount(totalItems);
            }
          }
        } catch (error) {
          console.error('Failed to fetch cart count:', error);
        } finally {
          setIsLoadingCart(false);
        }
      } else {
        setCartItemCount(0);
      }
    }

    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [session]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <ShoppingBag className="h-6 w-6 text-primary" />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Products
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session?.user && (
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" disabled={isLoadingCart}>
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
          {isPending ? (
            <Button variant="ghost" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : session?.user ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
