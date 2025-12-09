import { Router } from 'express';
import { db } from '../db/index.js';
import { wishlists } from '../db/schema.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const wishlistItems = await db.query.wishlists.findMany({
      where: eq(wishlists.userId, userId),
    });

    res.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const existing = await db.query.wishlists.findFirst({
      where: and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)),
    });

    if (existing) {
      return res.status(409).json({ error: 'Product already in wishlist' });
    }

    const [newItem] = await db
      .insert(wishlists)
      .values({
        userId,
        productId,
      })
      .returning();

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

router.delete('/:productId', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { productId } = req.params;

    const deleted = await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, productId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
