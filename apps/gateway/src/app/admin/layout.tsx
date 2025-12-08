'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, LogOut } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/login');
      } else {
        // @ts-expect-error - roleId might not be in type yet
        const role = session.user.roleId;
        const ADMIN_ROLE_ID = '9f28d6c7-9519-4598-b80c-783515456f43';
        if (role !== ADMIN_ROLE_ID) {
          router.push('/');
        }
      }
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: ShoppingBag },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 w-64 flex-col border-r bg-background hidden md:flex">
        <div className="flex-1 overflow-auto py-20">
          <nav className="grid items-start px-4 text-sm font-medium">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    pathname === link.href ? 'bg-muted text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t p-4">
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4" />
              Back to Store
            </Link>
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
