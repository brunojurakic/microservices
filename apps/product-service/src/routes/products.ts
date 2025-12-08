import { Router, type Request, type Response } from 'express';
import { db } from '../db/index.js';
import { products, categories, type NewProduct } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateJWT, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router: ReturnType<typeof Router> = Router();

router.get('/categories', async (req, res) => {
  try {
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;

    let query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (categoryId && typeof categoryId === 'string') {
      query.where(eq(products.categoryId, categoryId));
    }

    const allProducts = await query;
    res.json(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, req.params.id));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', authenticateJWT, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const newProduct: NewProduct = req.body;
    const [createdProduct] = await db.insert(products).values(newProduct).returning();

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authenticateJWT, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(products.id, req.params.id))
      .returning();

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authenticateJWT, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, req.params.id))
      .returning();

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
