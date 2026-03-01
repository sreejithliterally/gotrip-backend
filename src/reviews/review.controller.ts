import { Request, Response } from 'express';
import { reviewService } from './review.service';
import { sendSuccess } from '../common/utils/response';
import { AuthenticatedRequest } from '../common/types';

export class ReviewController {
  async create(req: AuthenticatedRequest, res: Response) {
    const review = await reviewService.create(req.user!.id, req.body);
    return sendSuccess(res, review, 'Review created', 201);
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const review = await reviewService.update(req.user!.id, String(req.params.id), req.body);
    return sendSuccess(res, review, 'Review updated');
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    const result = await reviewService.delete(req.user!.id, String(req.params.id));
    return sendSuccess(res, result, 'Review deleted');
  }

  async getByListing(req: Request, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const { reviews, meta } = await reviewService.getByListing(String(req.params.listingId), page, limit);
    return sendSuccess(res, reviews, 'Reviews fetched', 200, meta);
  }
}

export const reviewController = new ReviewController();
