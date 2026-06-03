import express from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
});