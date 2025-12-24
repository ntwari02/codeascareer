import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';
import {
  getProfile,
  getPublicProfile,
  updateProfile,
  uploadAvatar,
  addAddress,
  updateAddress,
  deleteAddress,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  updateNotificationSettings,
  updatePrivacySettings,
  updatePreferences,
  changePassword,
  updateSecuritySettings,
} from '../controllers/profileController';

const router = Router();

// Configure Multer storage for profile images
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profile');

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: (error: Error | null, destination: string) => void) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  },
});

// All profile routes require authentication
router.use(authenticate);

// Profile CRUD
router.get('/me', getProfile);
router.get('/public/:userId', getPublicProfile);
router.patch('/me', updateProfile);
// Avatar upload
router.post('/me/avatar', upload.single('avatar'), uploadAvatar);

// Address management
router.post('/me/addresses', addAddress);
router.put('/me/addresses/:index', updateAddress);
router.delete('/me/addresses/:index', deleteAddress);

// Payment method management
router.post('/me/payment-methods', addPaymentMethod);
router.put('/me/payment-methods/:index', updatePaymentMethod);
router.delete('/me/payment-methods/:index', deletePaymentMethod);

// Settings management
router.patch('/me/notifications', updateNotificationSettings);
router.patch('/me/privacy', updatePrivacySettings);
router.patch('/me/preferences', updatePreferences);
router.patch('/me/security', updateSecuritySettings);

// Password management
router.post('/me/change-password', changePassword);

export default router;

