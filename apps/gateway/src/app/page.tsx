import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight">Welcome to Our E-Commerce Store</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Discover amazing products at great prices. Built with microservices architecture.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
