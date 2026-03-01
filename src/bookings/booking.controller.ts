import { Request, Response } from 'express';
import { bookingService } from './booking.service';
import { sendSuccess } from '../common/utils/response';
import { AuthenticatedRequest } from '../common/types';

export class BookingController {
  async create(req: AuthenticatedRequest, res: Response) {
    const booking = await bookingService.create(req.user!.id, req.body);
    return sendSuccess(res, booking, 'Booking created', 201);
  }

  async cancel(req: AuthenticatedRequest, res: Response) {
    const { cancellation_reason } = req.body;
    const booking = await bookingService.cancel(req.user!.id, String(req.params.id), cancellation_reason);
    return sendSuccess(res, booking, 'Booking cancelled');
  }

  async getById(req: AuthenticatedRequest, res: Response) {
    const booking = await bookingService.getById(String(req.params.id), req.user!.id);
    return sendSuccess(res, booking);
  }

  async getUserBookings(req: AuthenticatedRequest, res: Response) {
    const page = parseInt(String(req.query.page)) || 1;
    const limit = parseInt(String(req.query.limit)) || 20;
    const { bookings, meta } = await bookingService.getUserBookings(req.user!.id, page, limit);
    return sendSuccess(res, bookings, 'Bookings fetched', 200, meta);
  }

  // Vendor
  async setAvailability(req: AuthenticatedRequest, res: Response) {
    const result = await bookingService.setAvailability(req.user!.id, req.body);
    return sendSuccess(res, result, 'Availability set');
  }

  async setBulkAvailability(req: AuthenticatedRequest, res: Response) {
    const result = await bookingService.setBulkAvailability(req.user!.id, req.body);
    return sendSuccess(res, result, 'Bulk availability set');
  }

  async getAvailability(req: Request, res: Response) {
    const listingId = String(req.params.listingId);
    const start_date = String(req.query.start_date);
    const end_date = String(req.query.end_date);
    const rows = await bookingService.getAvailability(listingId, start_date, end_date);
    return sendSuccess(res, rows);
  }
}

export const bookingController = new BookingController();
