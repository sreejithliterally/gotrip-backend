import { Wishlist } from '../models/wishlist.model';
import { Listing } from '../models/listing.model';
import { ListingMedia } from '../models/listing-media.model';
import { Category } from '../models/category.model';
import { ApiError } from '../common/utils/api-error';
import { ListingStatus } from '../common/types';

export class WishlistService {
  async toggle(userId: string, listingId: string): Promise<{ wishlisted: boolean }> {
    const listing = await Listing.findOne({
      where: { id: listingId, status: ListingStatus.PUBLISHED },
    });
    if (!listing) throw ApiError.notFound('Listing not found');

    const existing = await Wishlist.findOne({ where: { user_id: userId, listing_id: listingId } });

    if (existing) {
      await existing.destroy();
      return { wishlisted: false };
    }

    await Wishlist.create({ user_id: userId, listing_id: listingId });
    return { wishlisted: true };
  }

  async getWishlist(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { rows, count } = await Wishlist.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Listing,
          where: { status: ListingStatus.PUBLISHED },
          include: [
            { model: ListingMedia, limit: 3, order: [['sort_order', 'ASC']] },
            { model: Category, attributes: ['id', 'name', 'slug', 'type'] },
          ],
        },
      ],
    });

    const listings = rows.map((w) => ({
      wishlist_id: w.id,
      wishlisted_at: w.created_at,
      is_wishlisted: true,
      ...(w.listing as any).toJSON(),
    }));

    return {
      listings,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async isWishlisted(userId: string, listingId: string): Promise<boolean> {
    const entry = await Wishlist.findOne({ where: { user_id: userId, listing_id: listingId } });
    return !!entry;
  }

  async getWishlistedListingIds(userId: string, listingIds: string[]): Promise<Set<string>> {
    if (!listingIds.length) return new Set();

    const entries = await Wishlist.findAll({
      where: { user_id: userId, listing_id: listingIds },
      attributes: ['listing_id'],
    });

    return new Set(entries.map((e) => e.listing_id));
  }
}

export const wishlistService = new WishlistService();
