import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Order } from '../models/Order';

/**
 * Get all buyers with their statistics (admin only)
 * GET /api/admin/buyers
 */
export async function getBuyers(req: AuthenticatedRequest, res: Response) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: admin access required' });
    }

    const { status, search, page = '1', limit = '50' } = req.query as {
      status?: string;
      search?: string;
      page?: string;
      limit?: string;
    };

    // Build filter for buyers
    const filter: any = { role: 'buyer' };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      // Map status to user fields - you may need to adjust based on your User model
      // For now, we'll use a simple approach - you might need to add status field to User model
      // This is a placeholder - adjust based on your actual User model structure
    }

    // Add search filter
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Get buyers
    const buyers = await User.find(filter)
      .select('_id fullName email phone location createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get statistics for each buyer
    const buyersWithStats = await Promise.all(
      buyers.map(async (buyer: any) => {
        const buyerId = buyer._id;

        // Get order statistics
        const orderStats = await Order.aggregate([
          { $match: { buyerId: new mongoose.Types.ObjectId(buyerId) } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$total' },
              lastOrderDate: { $max: '$createdAt' },
            },
          },
        ]);

        const stats = orderStats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
        };

        // Get ticket count (open tickets) - SupportTicket is for sellers
        // For buyers, we'll set it to 0 for now
        // You can implement buyer tickets later if needed
        const ticketCount = 0;

        // Format last order date
        let lastOrder = 'No orders';
        if (stats.lastOrderDate) {
          const date = new Date(stats.lastOrderDate);
          lastOrder = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }

        // Determine status based on account (you may need to add status field to User model)
        // For now, we'll use a simple logic - active if they have orders, pending otherwise
        let accountStatus: 'active' | 'pending' | 'banned' = 'pending';
        if (stats.totalOrders > 0) {
          accountStatus = 'active';
        }

        // Determine KYC status (you may need to add KYC field to User model)
        // For now, we'll default to pending
        let kycStatus: 'verified' | 'pending' | 'rejected' = 'pending';

        // Generate customer ID from MongoDB _id
        const customerId = `CUS-${buyer._id.toString().slice(-6).toUpperCase()}`;

        return {
          id: customerId,
          name: buyer.fullName || 'Unknown',
          email: buyer.email || '',
          phone: buyer.phone || 'N/A',
          status: accountStatus,
          kyc: kycStatus,
          orders: stats.totalOrders || 0,
          totalSpent: stats.totalSpent || 0,
          lastOrder,
          tickets: ticketCount,
          notes: buyer.location ? `${buyer.location}` : '',
        };
      })
    );

    const total = await User.countDocuments(filter);

    return res.json({
      customers: buyersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Get buyers error:', error);
    return res.status(500).json({
      message: 'Failed to fetch buyers',
      error: error.message,
    });
  }
}

