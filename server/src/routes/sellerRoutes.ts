import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
  updateSellerOrderTracking,
} from '../controllers/sellerOrderController';
import {
  getSellerCollections,
  createSellerCollection,
  updateSellerCollection,
  deleteSellerCollection,
} from '../controllers/sellerCollectionController';

const router = Router();

// All seller routes require authenticated sellers
router.use(authenticate, authorize('seller'));

router.get('/orders', getSellerOrders);
router.get('/orders/:orderId', getSellerOrderById);
router.patch('/orders/:orderId/status', updateSellerOrderStatus);
router.patch('/orders/:orderId/tracking', updateSellerOrderTracking);
router.get('/collections', getSellerCollections);
router.post('/collections', createSellerCollection);
router.patch('/collections/:collectionId', updateSellerCollection);
router.delete('/collections/:collectionId', deleteSellerCollection);

export default router;


