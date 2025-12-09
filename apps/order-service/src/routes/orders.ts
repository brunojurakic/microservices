import { Router } from 'express';
import { db } from '../db/index.js';
import { orders, orderItems, shippingAddresses, orderStatusHistory } from '../db/schema.js';
import { authenticateJWT, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { eq, desc } from 'drizzle-orm';

const router = Router();

router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { items, totalAmount, shippingAddress } = req.body;

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

    if (shippingAddress) {
      await db.insert(shippingAddresses).values({
        orderId: newOrder.id,
        fullName: shippingAddress.fullName,
        street: shippingAddress.street,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone || null,
      });
    }

    await db.insert(orderStatusHistory).values({
      orderId: newOrder.id,
      status: 'pending',
      note: 'Order created',
    });

    const completeOrder = await db.query.orders.findFirst({
      where: eq(orders.id, newOrder.id),
      with: {
        items: true,
        shippingAddress: true,
        statusHistory: true,
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
        shippingAddress: true,
        statusHistory: true,
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
        shippingAddress: true,
        statusHistory: true,
      },
    });

    res.json(allOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.patch('/:id/status', authenticateJWT, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId));

    await db.insert(orderStatusHistory).values({
      orderId,
      status,
      note: note || null,
    });

    const updatedOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        shippingAddress: true,
        statusHistory: true,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
