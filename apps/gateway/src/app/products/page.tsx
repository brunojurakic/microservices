'use client';

import { useEffect, useState } from 'react';

import { getJWTToken } from '@/lib/jwt';
import { useSession } from '@/lib/auth-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const { getCategories, getProducts } = await import('@/lib/api');
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts(selectedCategory || undefined),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory]);

  const handleAddToCart = async (productId: string) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    setAddingToCart(productId);
    try {
      const token = await getJWTToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const CART_SERVICE_URL = process.env.NEXT_PUBLIC_CART_SERVICE_URL || 'http://localhost:3002';
      const res = await fetch(`${CART_SERVICE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!res.ok) {
        throw new Error('Failed to add item to cart');
      }

      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Products</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          size="sm"
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
            size="sm"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col overflow-hidden p-0 pb-5">
            <div className="relative h-48 w-full bg-muted overflow-hidden rounded-t-lg">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>

            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                {product.category && (
                  <Badge variant="secondary" className="shrink-0">
                    {product.category.name}
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {product.description || 'No description available'}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">${product.price}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.stock > 0 ? (
                    <span className="text-green-600">{product.stock} in stock</span>
                  ) : (
                    <span className="text-red-600">Out of stock</span>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                disabled={product.stock === 0 || addingToCart === product.id}
                onClick={() => handleAddToCart(product.id)}
              >
                {addingToCart === product.id
                  ? 'Adding...'
                  : product.stock > 0
                    ? 'Add to Cart'
                    : 'Out of Stock'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">No products found</p>
          <p className="text-muted-foreground text-sm mt-2">Check back later for new products</p>
        </div>
      )}
    </div>
  );
}
