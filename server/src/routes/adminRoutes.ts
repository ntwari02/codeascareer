import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { getBuyers } from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get all buyers with statistics
router.get('/buyers', getBuyers);

export default router;

