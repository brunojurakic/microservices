'use client';

import Link from 'next/link';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from '@/lib/auth-client';

export function Header() {
  const { data: session, isPending } = useSession();

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

        <div className="w-20">
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
