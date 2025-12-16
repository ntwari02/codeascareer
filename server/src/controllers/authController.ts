import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { generateAuthToken } from '../utils/generateToken';
import { AuthenticatedRequest } from '../middleware/auth';

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['buyer', 'seller', 'admin']).optional().default('buyer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function register(req: Request, res: Response) {
  
  try {
    const { fullName, email, password, role } = registerSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const isSeller = role === 'seller';

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role,
      // For sellers, start as pending and unverified until government/admin approval
      sellerVerificationStatus: isSeller ? 'pending' : undefined,
      isSellerVerified: isSeller ? false : undefined,
    });

    const token = generateAuthToken(user);

    // Send token as both JSON and HTTP-only cookie for flexibility
    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // set true behind HTTPS/proxy in production
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          sellerVerificationStatus: user.sellerVerificationStatus,
          isSellerVerified: user.isSellerVerified,
        },
        token,
      });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: err.flatten() });
    }
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Failed to register user' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateAuthToken(user);

    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          sellerVerificationStatus: user.sellerVerificationStatus,
          isSellerVerified: user.isSellerVerified,
        },
        token,
      });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: err.flatten() });
    }
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Failed to login' });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user });
}


