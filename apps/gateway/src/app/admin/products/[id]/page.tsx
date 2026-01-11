'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useRouter, useParams } from 'next/navigation';
import { updateProduct, getProduct, getCategories, type Category } from '@/lib/api';
import { getJWTToken } from '@/lib/jwt';
import { Spinner } from '@/components/ui/spinner';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, product] = await Promise.all([getCategories(), getProduct(productId)]);

        setCategories(cats);
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          stock: product.stock.toString(),
          imageUrl: product.imageUrl || '',
          categoryId: product.categoryId || '',
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        alert('Could not find product');
        router.push('/admin/products');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [productId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getJWTToken();
      if (!token) return;

      await updateProduct(token, productId, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: parseInt(formData.stock),
        imageUrl: formData.imageUrl || null,
        categoryId: formData.categoryId || null,
      });

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Failed to update product', error);
      alert('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching)
    return (
      <div className="flex justify-center p-20">
        <Spinner />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground text-sm">
          Update product details and stock information.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                required
                value={formData.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
