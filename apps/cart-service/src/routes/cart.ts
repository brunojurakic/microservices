import { Router } from 'express';
import { db } from '../db/index.js';
import { carts, cartItems } from '../db/schema.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });

    if (!cart) {
      const [newCart] = await db.insert(carts).values({ userId }).returning();
      cart = newCart;
    }

    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
    });

    res.json({
      cart,
      items,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/items', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    let cart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });

    if (!cart) {
      const [newCart] = await db.insert(carts).values({ userId }).returning();
      cart = newCart;
    }

    const existingItem = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)),
    });

    let item;
    if (existingItem) {
      [item] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
    } else {
      [item] = await db
        .insert(cartItems)
        .values({
          cartId: cart.id,
          productId,
          quantity,
        })
        .returning();
    }

    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

router.put('/items/:itemId', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)),
    });

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId))
      .returning();

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

router.delete('/items/:itemId', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { itemId } = req.params;

    const cart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)),
    });

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await db.delete(cartItems).where(eq(cartItems.id, itemId));

    res.status(204).send();
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

router.delete('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const cart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    res.status(204).send();
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
