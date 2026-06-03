import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: (role as Role) || Role.USER
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);

    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const accessTokenOptions: SignOptions = { expiresIn: '15m' };
    const refreshTokenOptions: SignOptions = { expiresIn: '7d' };

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role as string },
      process.env.JWT_SECRET as string,
      accessTokenOptions
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role as string },
      process.env.JWT_REFRESH_SECRET as string,
      refreshTokenOptions
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken }
    });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: String(error) });
  }
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: number; email: string; role: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || (user as any).refreshToken !== refreshToken) {
      res.status(403).json({ error: 'Invalid refresh token' });
      return;
    }

    const accessTokenOptions: SignOptions = { expiresIn: '15m' };

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role as string },
      process.env.JWT_SECRET as string,
      accessTokenOptions
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const user = await prisma.user.findFirst({
      where: { refreshToken: refreshToken } as any
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null }
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: String(error) });
  }
};