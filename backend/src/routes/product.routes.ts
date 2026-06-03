import { Router } from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAllProducts);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), createProduct);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'MANAGER'), updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteProduct);

export default router;