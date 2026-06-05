import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) { res.status(400).json({ error: 'Email already exists' }); return; }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, role: (role as Role) || Role.USER } });
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: String(error) }); }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(401).json({ error: 'Invalid email or password' }); return; }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { res.status(401).json({ error: 'Invalid email or password' }); return; }
    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role as string }, process.env.JWT_SECRET as string, { expiresIn: '15m' } as SignOptions);
    const refreshToken = jwt.sign({ id: user.id, email: user.email, role: user.role as string }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' } as SignOptions);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    res.json({ message: 'Login successful', accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: String(error) }); }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(401).json({ error: 'Refresh token required' }); return; }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: number; email: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || (user as any).refreshToken !== refreshToken) { res.status(403).json({ error: 'Invalid refresh token' }); return; }
    const newAccessToken = jwt.sign({ id: user.id, email: user.email, role: user.role as string }, process.env.JWT_SECRET as string, { expiresIn: '15m' } as SignOptions);
    res.json({ accessToken: newAccessToken });
  } catch (error) { res.status(403).json({ error: 'Invalid or expired refresh token' }); }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const user = await prisma.user.findFirst({ where: { refreshToken } as any });
    if (user) { await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } }); }
    res.json({ message: 'Logged out successfully' });
  } catch (error) { res.status(500).json({ error: String(error) }); }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.id;
    if (newPassword !== confirmPassword) { res.status(400).json({ error: 'New password and confirm password do not match' }); return; }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) { res.status(401).json({ error: 'Current password is incorrect' }); return; }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedNewPassword } });
    res.json({ message: 'Password changed successfully' });
  } catch (error) { res.status(500).json({ error: 'Something went wrong' }); }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const resetToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '15m' } as SignOptions);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: resetToken } });
    res.json({ message: 'Password reset token generated', resetToken });
  } catch (error) { 
    console.error('Forgot password error:', error);
    res.status(500).json({ error: String(error) }); 
  }
};
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) { res.status(400).json({ error: 'Passwords do not match' }); return; }
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string) as { id: number; email: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || (user as any).refreshToken !== resetToken) { res.status(403).json({ error: 'Invalid or expired reset token' }); return; }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: decoded.id }, data: { password: hashedPassword, refreshToken: null } });
    res.json({ message: 'Password reset successfully' });
  } catch (error) { res.status(403).json({ error: 'Invalid or expired reset token' }); }
};