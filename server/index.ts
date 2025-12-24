import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './src/routes/authRoutes';
import inventoryRoutes from './src/routes/inventoryRoutes';
import profileRoutes from './src/routes/profileRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Basic validation to help during setup
if (!MONGO_URI) {
  console.error('MONGO_URI is not set in .env');
}

// Global middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
// Static files for uploaded images
// Allow product images to be embedded from a different origin (e.g. Vite dev server on 5173)
// by relaxing the Cross-Origin-Resource-Policy for this path only.
app.use(
  '/uploads',
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Reaglex API is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);
// Profile routes
app.use('/api/profile', profileRoutes);
// Seller inventory routes
app.use('/api/seller/inventory', inventoryRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB, then start server
const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI is not set in .env file');
      process.exit(1);
    }

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    // For development: allow invalid certificates to resolve TLS handshake issues
    // Remove this in production and ensure proper SSL certificates are configured
    if (process.env.NODE_ENV !== 'production') {
      options.tlsAllowInvalidCertificates = true;
    }

    await mongoose.connect(MONGO_URI, options);
    
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err: any) {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

connectDB();



