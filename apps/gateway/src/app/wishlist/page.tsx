'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { getJWTToken } from '@/lib/jwt';
import {
  getWishlist,
  getProducts,
  removeFromWishlist,
  addToCart,
  type WishlistItem,
  type Product,
} from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface WishlistItemWithProduct extends WishlistItem {
  product: Product | null;
}

export default function WishlistPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchWishlist() {
      if (!session?.user) return;

      try {
        const token = await getJWTToken();
        if (!token) return;

        const [wishlist, products] = await Promise.all([getWishlist(token), getProducts()]);

        const itemsWithProducts = wishlist.map((item) => ({
          ...item,
          product: products.find((p) => p.id === item.productId) || null,
        }));

        setWishlistItems(itemsWithProducts);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWishlist();
  }, [session]);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      const token = await getJWTToken();
      if (!token) return;

      await removeFromWishlist(token, productId);
      setWishlistItems((items) => items.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      const token = await getJWTToken();
      if (!token) return;

      await addToCart(token, productId, 1);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

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
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-8 w-8" />
          My Wishlist
        </h1>
        <p className="text-muted-foreground mt-2">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save products you love by clicking the heart icon!
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 shrink-0 rounded-md overflow-hidden bg-muted">
                    {item.product?.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold">{item.product?.name || 'Unknown Product'}</h3>
                      <p className="text-lg font-bold text-primary">
                        ${item.product?.price || '0.00'}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item.productId)}
                        disabled={addingToCart === item.productId}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemove(item.productId)}
                        disabled={removingId === item.productId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
