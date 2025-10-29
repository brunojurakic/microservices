import { getProducts } from '@/lib/api';
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
import Image from 'next/image';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground mt-2">Browse our collection of products</p>
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
                    {product.category}
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
              <Button className="w-full" disabled={product.stock === 0}>
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
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
