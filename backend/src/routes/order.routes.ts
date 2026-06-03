import { Router } from 'express';
import { getAllOrders, createOrder, updateOrder, deleteOrder } from '../controllers/order.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), getAllOrders);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'USER'), createOrder);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), updateOrder);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteOrder);

export default router;