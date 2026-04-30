import { Response } from 'express';
import { wishlistService } from './wishlist.service';
import { sendSuccess } from '../common/utils/response';
import { AuthenticatedRequest } from '../common/types';

export class WishlistController {
  async toggle(req: AuthenticatedRequest, res: Response) {
    const result = await wishlistService.toggle(req.user!.id, String(req.params.listingId));
    const message = result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist';
    return sendSuccess(res, result, message);
  }

  async getWishlist(req: AuthenticatedRequest, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const { listings, meta } = await wishlistService.getWishlist(req.user!.id, page, limit);
    return sendSuccess(res, listings, 'Wishlist fetched', 200, meta);
  }
}

export const wishlistController = new WishlistController();
