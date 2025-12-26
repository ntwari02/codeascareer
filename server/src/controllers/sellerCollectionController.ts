import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { Collection } from '../models/Collection';

// Helper to generate a slug from a name
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Map request body (snake_case) to Collection document fields
function mapBodyToCollectionFields(body: any) {
  const mapped: any = {};

  if (body.name !== undefined) mapped.name = body.name;
  if (body.slug !== undefined) mapped.slug = body.slug;
  if (body.description !== undefined) mapped.description = body.description;
  if (body.image_url !== undefined) mapped.imageUrl = body.image_url;
  if (body.cover_image_url !== undefined) mapped.coverImageUrl = body.cover_image_url;
  if (body.type !== undefined) mapped.type = body.type;
  if (body.sort_order !== undefined) mapped.sortOrder = body.sort_order;
  if (body.visibility !== undefined) mapped.visibility = body.visibility;
  if (body.is_active !== undefined) mapped.isActive = body.is_active;
  if (body.is_featured !== undefined) mapped.isFeatured = body.is_featured;
  if (body.is_draft !== undefined) mapped.isDraft = body.is_draft;
  if (body.is_trending !== undefined) mapped.isTrending = body.is_trending;
  if (body.is_seasonal !== undefined) mapped.isSeasonal = body.is_seasonal;
  if (body.is_sale !== undefined) mapped.isSale = body.is_sale;
  if (body.seo_title !== undefined) mapped.seoTitle = body.seo_title;
  if (body.seo_description !== undefined) mapped.seoDescription = body.seo_description;
  if (body.conditions !== undefined) mapped.conditions = body.conditions;
  if (body.placement !== undefined) mapped.placement = body.placement;
  if (body.placement_priority !== undefined) mapped.placementPriority = body.placement_priority;
  if (body.published_at !== undefined) mapped.publishedAt = body.published_at;
  if (body.scheduled_publish_at !== undefined)
    mapped.scheduledPublishAt = body.scheduled_publish_at;

  return mapped;
}

// GET /api/seller/collections
export async function getSellerCollections(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const sellerObjectId = new mongoose.Types.ObjectId(req.user.id);

    const collections = await Collection.find({ sellerId: sellerObjectId } as any)
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ collections });
  } catch (err: any) {
    console.error('Error fetching seller collections:', err);
    return res.status(500).json({ message: 'Failed to fetch collections' });
  }
}

// POST /api/seller/collections
export async function createSellerCollection(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const sellerObjectId = new mongoose.Types.ObjectId(req.user.id);
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    let slug: string | undefined = req.body.slug;
    if (!slug) {
      slug = generateSlug(name);
    }

    const fields = mapBodyToCollectionFields({ ...req.body, slug });

    const created = await Collection.create(
      {
        sellerId: sellerObjectId,
        ...fields,
      } as any
    );

    return res.status(201).json({ collection: created });
  } catch (err: any) {
    console.error('Error creating seller collection:', err);
    return res.status(500).json({ message: 'Failed to create collection' });
  }
}

// PATCH /api/seller/collections/:collectionId
export async function updateSellerCollection(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const sellerObjectId = new mongoose.Types.ObjectId(req.user.id);
    const { collectionId } = req.params;

    const collectionObjectId = new mongoose.Types.ObjectId(collectionId);

    const fields = mapBodyToCollectionFields(req.body);

    const updated = await Collection.findOneAndUpdate(
      { _id: collectionObjectId, sellerId: sellerObjectId } as any,
      { $set: fields } as any,
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.json({ collection: updated });
  } catch (err: any) {
    console.error('Error updating seller collection:', err);
    return res.status(500).json({ message: 'Failed to update collection' });
  }
}

// DELETE /api/seller/collections/:collectionId
export async function deleteSellerCollection(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const sellerObjectId = new mongoose.Types.ObjectId(req.user.id);
    const { collectionId } = req.params;

    const collectionObjectId = new mongoose.Types.ObjectId(collectionId);

    const deleted = await Collection.findOneAndDelete(
      {
        _id: collectionObjectId,
        sellerId: sellerObjectId,
      } as any
    ).lean();

    if (!deleted) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting seller collection:', err);
    return res.status(500).json({ message: 'Failed to delete collection' });
  }
}


