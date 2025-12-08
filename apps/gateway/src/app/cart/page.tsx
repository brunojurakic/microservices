'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { getJWTToken } from '@/lib/jwt';
import {
  getProducts,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartAPI,
  type Product,
  type CartItem,
} from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface CartItemWithProduct extends CartItem {
  product: Product;
}

export default function CartPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchCart() {
      if (!session?.user) return;

      try {
        const token = await getJWTToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const cartData = await getCart(token);
        const products = await getProducts();

        const itemsWithProducts = cartData.items.map((item: CartItem) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            ...item,
            product: product || {
              id: item.productId,
              name: 'Unknown Product',
              description: null,
              price: '0',
              imageUrl: null,
              stock: 0,
              categoryId: null,
              category: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };
        });

        setCartItems(itemsWithProducts);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCart();
  }, [session, router]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsUpdating(itemId);
    try {
      const token = await getJWTToken();
      if (!token) throw new Error('No token');

      await updateCartItem(token, itemId, newQuantity);

      setCartItems((items) =>
        items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
      );

      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsUpdating(itemId);
    try {
      const token = await getJWTToken();
      if (!token) throw new Error('No token');

      await removeCartItem(token, itemId);

      setCartItems((items) => items.filter((item) => item.id !== itemId));

      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleClearCart = async () => {
    try {
      const token = await getJWTToken();
      if (!token) throw new Error('No token');

      await clearCartAPI(token);

      setCartItems([]);

      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity;
  }, 0);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground mt-2">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        {cartItems.length > 0 && (
          <Button variant="destructive" onClick={handleClearCart}>
            Clear Cart
          </Button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Start adding some products to your cart!</p>
            <Button asChild>
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 shrink-0 rounded-md overflow-hidden bg-muted">
                      {item.product.imageUrl ? (
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
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        {item.product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.product.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating === item.id || item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating === item.id}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold">
                            ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={isUpdating === item.id}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-sm text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={async () => {
                    try {
                      const token = await getJWTToken();
                      if (!token) {
                        router.push('/login');
                        return;
                      }

                      const { createOrder, clearCart } = await import('@/lib/api');

                      const orderItems = cartItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: parseFloat(item.product.price),
                      }));

                      await createOrder(token, orderItems, totalPrice);

                      await clearCart(token);
                      window.dispatchEvent(new CustomEvent('cartUpdated'));

                      router.push('/orders/success');
                    } catch (error) {
                      console.error('Checkout failed:', error);
                      alert('Checkout failed. Please try again.');
                    }
                  }}
                  disabled={isPending || cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
