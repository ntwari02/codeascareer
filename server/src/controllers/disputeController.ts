import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Dispute } from '../models/Dispute';
import mongoose from 'mongoose';

const getSellerId = (req: AuthenticatedRequest): mongoose.Types.ObjectId | null => {
  if (!req.user?.id) return null;
  try {
    return new mongoose.Types.ObjectId(req.user.id);
  } catch {
    return null;
  }
};

/**
 * Get all disputes for seller
 */
export async function getDisputes(req: AuthenticatedRequest, res: Response) {
  try {
    const sellerId = getSellerId(req);
    if (!sellerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { sellerId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    const disputes = await Dispute.find(filter)
      .populate('orderId', 'orderNumber totalAmount')
      .populate('buyerId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .lean();

    const total = await Dispute.countDocuments(filter);

    return res.json({
      disputes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get disputes error:', error);
    return res.status(500).json({ message: 'Failed to fetch disputes' });
  }
}

/**
 * Get single dispute
 */
export async function getDispute(req: AuthenticatedRequest, res: Response) {
  try {
    const sellerId = getSellerId(req);
    if (!sellerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { disputeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
      return res.status(400).json({ message: 'Invalid dispute ID' });
    }

    const dispute = await Dispute.findOne({
      _id: disputeId,
      sellerId,
    })
      .populate('orderId')
      .populate('buyerId', 'fullName email')
      .populate('resolvedBy', 'fullName email')
      .lean();

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    return res.json({ dispute });
  } catch (error: any) {
    console.error('Get dispute error:', error);
    return res.status(500).json({ message: 'Failed to fetch dispute' });
  }
}

/**
 * Submit seller response to dispute
 */
export async function submitSellerResponse(req: AuthenticatedRequest, res: Response) {
  try {
    const sellerId = getSellerId(req);
    if (!sellerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { disputeId } = req.params;
    const { response, evidence } = req.body;

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
      return res.status(400).json({ message: 'Invalid dispute ID' });
    }

    if (!response || !response.trim()) {
      return res.status(400).json({ message: 'Response is required' });
    }

    const dispute = await Dispute.findOne({
      _id: disputeId,
      sellerId,
    });

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    if (dispute.status === 'resolved' || dispute.status === 'approved' || dispute.status === 'rejected') {
      return res.status(400).json({ message: 'Dispute is already resolved' });
    }

    // Add evidence if provided
    const evidenceArray = Array.isArray(evidence) ? evidence : [];
    const newEvidence = evidenceArray.map((ev: any) => ({
      type: ev.type || 'other',
      url: ev.url,
      description: ev.description,
      uploadedAt: new Date(),
    }));

    dispute.sellerResponse = response;
    dispute.sellerResponseAt = new Date();
    dispute.evidence = [...dispute.evidence, ...newEvidence];
    dispute.status = 'seller_response';

    await dispute.save();

    return res.json({
      message: 'Response submitted successfully',
      dispute,
    });
  } catch (error: any) {
    console.error('Submit seller response error:', error);
    return res.status(500).json({ message: 'Failed to submit response' });
  }
}

/**
 * Upload evidence for dispute
 */
export async function uploadEvidence(req: AuthenticatedRequest, res: Response) {
  try {
    const sellerId = getSellerId(req);
    if (!sellerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { disputeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(disputeId)) {
      return res.status(400).json({ message: 'Invalid dispute ID' });
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const dispute = await Dispute.findOne({
      _id: disputeId,
      sellerId,
    });

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    const files = (req.files as Express.Multer.File[]).map((file) => ({
      type: 'document' as const,
      url: `/uploads/disputes/${file.filename}`,
      description: file.originalname,
      uploadedAt: new Date(),
    }));

    dispute.evidence = [...dispute.evidence, ...files];
    await dispute.save();

    return res.json({
      message: 'Evidence uploaded successfully',
      files: files.map((f) => ({ url: f.url, description: f.description })),
    });
  } catch (error: any) {
    console.error('Upload evidence error:', error);
    return res.status(500).json({ message: 'Failed to upload evidence' });
  }
}

