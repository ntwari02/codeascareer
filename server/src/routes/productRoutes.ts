import { Router } from 'express';
import { trackProductView, getProductById } from '../controllers/productController';

const router = Router();

// Public routes (no authentication required for viewing products)
// Track product view
router.post('/:productId/view', trackProductView);

// Get product by ID (also tracks view)
router.get('/:productId', getProductById);

export default router;

