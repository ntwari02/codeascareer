import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import {
  getDisputes,
  getDispute,
  submitSellerResponse,
  uploadEvidence,
} from '../controllers/disputeController';

const router = Router();

// Configure Multer for dispute evidence
const uploadsDir = path.join(__dirname, '../../uploads/disputes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const disputeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `dispute-${uniqueSuffix}${ext}`);
  },
});

const disputeUpload = multer({
  storage: disputeStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  },
});

// All routes require authentication and seller role
router.use(authenticate);
router.use(authorize('seller', 'admin'));

// Get all disputes
router.get('/', getDisputes);

// Get single dispute
router.get('/:disputeId', getDispute);

// Submit seller response
router.post('/:disputeId/response', submitSellerResponse);

// Upload evidence
router.post('/:disputeId/evidence', disputeUpload.array('files', 10), uploadEvidence);

export default router;

