'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { createCategory } from '@/lib/api';
import { getJWTToken } from '@/lib/jwt';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      setFormData({
        ...formData,
        name: value,
        slug: generateSlug(value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getJWTToken();
      if (!token) {
        alert('Authentication required');
        return;
      }

      await createCategory(token, {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || null,
      });

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Failed to create category', error);
      alert('Failed to create category. Ensure the name/slug is unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground flex items-center hover:text-primary mb-2"
        >
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to Products
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">New Category</h1>
        <p className="text-muted-foreground text-sm">
          Create a unique category and slug for product filtering.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Smart Home"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Slug Field (Auto-generated) */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL Path)</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="smart-home"
              required
              value={formData.slug}
              onChange={handleChange}
            />
            <p className="text-[12px] text-muted-foreground">
              This is used in the URL: /category/<strong>{formData.slug || 'slug'}</strong>
            </p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional description of this category..."
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.name || !formData.slug}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Category
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
