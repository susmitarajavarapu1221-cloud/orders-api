import { Request, Response } from 'express';
import prisma from '../prisma';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, stock } = req.body;
    const product = await prisma.product.create({
      data: { name, price: Number(price), stock: Number(stock) }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, price: Number(price), stock: Number(stock) }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};