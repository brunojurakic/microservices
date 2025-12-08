const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:3002';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  category: Category | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products/categories`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }

  return res.json();
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const url = categoryId
    ? `${PRODUCT_SERVICE_URL}/products?categoryId=${categoryId}`
    : `${PRODUCT_SERVICE_URL}/products`;

  const res = await fetch(url, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }

  return res.json();
}

export async function createProduct(
  jwtToken: string,
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(product),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to create product');
  }

  return res.json();
}

export async function deleteProduct(jwtToken: string, id: string): Promise<void> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to delete product');
  }
}

export async function getAllOrders(jwtToken: string): Promise<Order[]> {
  const res = await fetch(`${ORDER_SERVICE_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch all orders');
  }

  return res.json();
}

export async function getCart(jwtToken: string): Promise<{ cart: Cart; items: CartItem[] }> {
  const res = await fetch(`${CART_SERVICE_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch cart');
  }

  return res.json();
}

export async function addToCart(
  jwtToken: string,
  productId: string,
  quantity = 1
): Promise<CartItem> {
  const res = await fetch(`${CART_SERVICE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ productId, quantity }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to add item to cart');
  }

  return res.json();
}

export async function updateCartItem(
  jwtToken: string,
  itemId: string,
  quantity: number
): Promise<CartItem> {
  const res = await fetch(`${CART_SERVICE_URL}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ quantity }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to update cart item');
  }

  return res.json();
}

export async function removeCartItem(jwtToken: string, itemId: string): Promise<void> {
  const res = await fetch(`${CART_SERVICE_URL}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to remove cart item');
  }
}

export async function clearCart(jwtToken: string): Promise<void> {
  const res = await fetch(`${CART_SERVICE_URL}/cart`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to clear cart');
  }
}

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

export interface OrderItem {
  id: number;
  orderId: number;
  productId: string;
  quantity: number;
  priceAtPurchase: string;
}

export interface Order {
  id: number;
  userId: string;
  totalAmount: string;
  status: 'pending' | 'completed' | 'cancelled';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export async function createOrder(
  jwtToken: string,
  items: { productId: string; quantity: number; price: number }[],
  totalAmount: number
): Promise<Order> {
  const res = await fetch(`${ORDER_SERVICE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ items, totalAmount }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to create order');
  }

  return res.json();
}

export async function getMyOrders(jwtToken: string): Promise<Order[]> {
  const res = await fetch(`${ORDER_SERVICE_URL}/orders/my-orders`, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch orders');
  }

  return res.json();
}
