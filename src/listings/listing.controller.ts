import { Request, Response } from 'express';
import { listingService } from './listing.service';
import { sendSuccess } from '../common/utils/response';
import { AuthenticatedRequest } from '../common/types';

export class ListingController {
  // Public
  async browse(req: Request, res: Response) {
    const { listings, meta } = await listingService.browse(req.query as any);
    return sendSuccess(res, listings, 'Listings fetched', 200, meta);
  }

  async getById(req: Request, res: Response) {
    const listing = await listingService.getById(String(req.params.id));
    return sendSuccess(res, listing);
  }

  // Vendor
  async create(req: AuthenticatedRequest, res: Response) {
    const listing = await listingService.create(req.user!.id, req.body);
    return sendSuccess(res, listing, 'Listing created', 201);
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const listing = await listingService.update(req.user!.id, String(req.params.id), req.body);
    return sendSuccess(res, listing, 'Listing updated');
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    const result = await listingService.delete(req.user!.id, String(req.params.id));
    return sendSuccess(res, result, 'Listing deleted');
  }

  async getVendorListings(req: AuthenticatedRequest, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const { listings, meta } = await listingService.getVendorListings(req.user!.id, page, limit);
    return sendSuccess(res, listings, 'Vendor listings fetched', 200, meta);
  }

  async addMedia(req: AuthenticatedRequest, res: Response) {
    const { url, sort_order } = req.body;
    const media = await listingService.addMedia(req.user!.id, String(req.params.id), url, sort_order);
    return sendSuccess(res, media, 'Media added', 201);
  }

  async removeMedia(req: AuthenticatedRequest, res: Response) {
    const result = await listingService.removeMedia(req.user!.id, String(req.params.mediaId));
    return sendSuccess(res, result, 'Media removed');
  }
}

export const listingController = new ListingController();
