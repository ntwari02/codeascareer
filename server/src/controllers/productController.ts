import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { Product } from '../models/Product';

/**
 * Track product view (increment view count)
 * This can be called by anyone (buyers viewing products)
 */
export async function trackProductView(req: AuthenticatedRequest, res: Response) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Increment view count
    const result = await Product.updateOne(
      { _id: productId },
      { $inc: { views: 1 } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get updated product to return current view count
    const product = await Product.findById(productId).select('views').lean();
    
    return res.json({ 
      success: true, 
      views: product?.views || 0 
    });
  } catch (error: any) {
    console.error('Track product view error:', error);
    return res.status(500).json({ message: 'Failed to track product view' });
  }
}

/**
 * Get product by ID (public endpoint for buyers)
 */
export async function getProductById(req: AuthenticatedRequest, res: Response) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views when product is fetched
    await Product.updateOne({ _id: productId }, { $inc: { views: 1 } });

    return res.json({ 
      product: {
        ...product,
        views: (product.views || 0) + 1, // Return incremented value
      }
    });
  } catch (error: any) {
    console.error('Get product by ID error:', error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
}

