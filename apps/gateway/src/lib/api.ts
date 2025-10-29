const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  imageUrl: string | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products`, {
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
