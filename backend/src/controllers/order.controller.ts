import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: { include: { product: true } },
        user: true
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, items } = req.body;
    const totalPrice = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0
    );
    const order = await prisma.order.create({
      data: {
        userId: Number(userId),
        totalPrice,
        items: { create: items }
      },
      include: { items: true }
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.orderItem.deleteMany({
      where: { orderId: Number(id) }
    });
    await prisma.order.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};