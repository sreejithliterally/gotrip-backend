import { Review } from '../models/review.model';
import { Booking } from '../models/booking.model';
import { User } from '../models/user.model';
import { ApiError } from '../common/utils/api-error';
import { BookingStatus } from '../common/types';
import { CreateReviewInput, UpdateReviewInput } from './review.validator';

export class ReviewService {
  async create(userId: string, input: CreateReviewInput) {
    const hasBooking = await Booking.findOne({
      where: { user_id: userId, listing_id: input.listing_id, status: BookingStatus.COMPLETED },
    });
    if (!hasBooking) throw ApiError.forbidden('You can only review listings you have completed a booking for');

    const existing = await Review.findOne({ where: { user_id: userId, listing_id: input.listing_id } });
    if (existing) throw ApiError.conflict('You have already reviewed this listing');

    return Review.create({ user_id: userId, ...input });
  }

  async update(userId: string, reviewId: string, input: UpdateReviewInput) {
    const review = await Review.findByPk(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.user_id !== userId) throw ApiError.forbidden('Not your review');
    await review.update(input);
    return review;
  }

  async delete(userId: string, reviewId: string) {
    const review = await Review.findByPk(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.user_id !== userId) throw ApiError.forbidden('Not your review');
    await review.destroy();
    return { deleted: true };
  }

  async getByListing(listingId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Review.findAndCountAll({
      where: { listing_id: listingId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: User, attributes: ['id', 'full_name'] }],
    });

    return {
      reviews: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }
}

export const reviewService = new ReviewService();
