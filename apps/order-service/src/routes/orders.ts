import { Router } from 'express';
import { db } from '../db/index.js';
import { orders, orderItems } from '../db/schema.js';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { eq, desc } from 'drizzle-orm';

const router = Router();

router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have items' });
    }

    const [newOrder] = await db
      .insert(orders)
      .values({
        userId,
        totalAmount: totalAmount.toString(),
        status: 'pending',
      })
      .returning();

    const orderItemsToInsert = items.map((item: any) => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.price.toString(),
    }));

    await db.insert(orderItems).values(orderItemsToInsert);
    const completeOrder = await db.query.orders.findFirst({
      where: eq(orders.id, newOrder.id),
      with: {
        items: true,
      },
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/my-orders', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: true,
      },
    });

    res.json(userOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/', authenticateJWT, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        items: true,
      },
    });

    res.json(allOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
