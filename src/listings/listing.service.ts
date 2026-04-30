import { Op } from 'sequelize';
import { Listing } from '../models/listing.model';
import { ListingMedia } from '../models/listing-media.model';
import { Vendor } from '../models/vendor.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';
import { ApiError } from '../common/utils/api-error';
import { ListingStatus, VendorStatus } from '../common/types';
import { CreateListingInput, UpdateListingInput } from './listing.validator';
import { wishlistService } from '../wishlists/wishlist.service';

export class ListingService {
  async browse(
    query: {
      category_id?: string;
      location?: string;
      min_price?: string;
      max_price?: string;
      page?: string;
      limit?: string;
      sort_by?: string;
      sort_order?: string;
    },
    userId?: string,
  ) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const offset = (page - 1) * limit;
    const sortBy = query.sort_by || 'created_at';
    const sortOrder = query.sort_order || 'DESC';

    const where: Record<string, any> = { status: ListingStatus.PUBLISHED };

    if (query.category_id) where.category_id = query.category_id;
    if (query.location) where.location = { [Op.iLike]: `%${query.location}%` };
    if (query.min_price) where.price_start = { ...where.price_start, [Op.gte]: parseFloat(query.min_price) };
    if (query.max_price) where.price_start = { ...where.price_start, [Op.lte]: parseFloat(query.max_price) };

    const { rows, count } = await Listing.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      include: [
        { model: ListingMedia, limit: 3, order: [['sort_order', 'ASC']] },
        { model: Category, attributes: ['id', 'name', 'slug', 'type'] },
      ],
    });

    let wishlistedIds = new Set<string>();
    if (userId) {
      wishlistedIds = await wishlistService.getWishlistedListingIds(
        userId,
        rows.map((l) => l.id),
      );
    }

    const listings = rows.map((l) => ({
      ...l.toJSON(),
      is_wishlisted: wishlistedIds.has(l.id),
    }));

    return {
      listings,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async getById(id: string, userId?: string) {
    const listing = await Listing.findByPk(id, {
      include: [
        { model: ListingMedia, order: [['sort_order', 'ASC']] },
        { model: Category, attributes: ['id', 'name', 'slug', 'type'] },
        { model: Vendor, attributes: ['id', 'business_name'] },
        { model: Review, limit: 10, order: [['created_at', 'DESC']] },
      ],
    });
    if (!listing) throw ApiError.notFound('Listing not found');

    const is_wishlisted = userId ? await wishlistService.isWishlisted(userId, id) : false;

    return { ...listing.toJSON(), is_wishlisted };
  }

  async create(vendorUserId: string, input: CreateListingInput) {
    const vendor = await Vendor.findOne({ where: { user_id: vendorUserId } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');
    if (vendor.status !== VendorStatus.APPROVED) throw ApiError.forbidden('Vendor not approved');

    return Listing.create({ vendor_id: vendor.id, ...input, status: ListingStatus.DRAFT });
  }

  async update(vendorUserId: string, listingId: string, input: UpdateListingInput) {
    const vendor = await Vendor.findOne({ where: { user_id: vendorUserId } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');

    const listing = await Listing.findOne({ where: { id: listingId, vendor_id: vendor.id } });
    if (!listing) throw ApiError.notFound('Listing not found or not owned by you');

    await listing.update(input);
    return listing;
  }

  async delete(vendorUserId: string, listingId: string) {
    const vendor = await Vendor.findOne({ where: { user_id: vendorUserId } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');

    const listing = await Listing.findOne({ where: { id: listingId, vendor_id: vendor.id } });
    if (!listing) throw ApiError.notFound('Listing not found or not owned by you');

    await listing.destroy();
    return { deleted: true };
  }

  async getVendorListings(vendorUserId: string, page = 1, limit = 20) {
    const vendor = await Vendor.findOne({ where: { user_id: vendorUserId } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');

    const offset = (page - 1) * limit;
    const { rows, count } = await Listing.findAndCountAll({
      where: { vendor_id: vendor.id },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: ListingMedia, limit: 1 }],
    });

    return {
      listings: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async addMedia(vendorUserId: string, listingId: string, url: string, sort_order = 0) {
    const vendor = await Vendor.findOne({ where: { user_id: vendorUserId } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');

    const listing = await Listing.findOne({ where: { id: listingId, vendor_id: vendor.id } });
    if (!listing) throw ApiError.notFound('Listing not found or not owned by you');

    return ListingMedia.create({ listing_id: listingId, url, sort_order });
  }

  async removeMedia(vendorUserId: string, mediaId: string) {
    const vendor = await Vendor.findOne({ where: { user_id: vendorUserId } });
    if (!vendor) throw ApiError.notFound('Vendor profile not found');

    const media = await ListingMedia.findByPk(mediaId, {
      include: [{ model: Listing, where: { vendor_id: vendor.id } }],
    });
    if (!media) throw ApiError.notFound('Media not found');

    await media.destroy();
    return { deleted: true };
  }
}

export const listingService = new ListingService();
