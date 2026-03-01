import { Transaction } from 'sequelize';
import sequelize from '../db/database';
import { Booking } from '../models/booking.model';
import { Availability } from '../models/availability.model';
import { Listing } from '../models/listing.model';
import { Vendor } from '../models/vendor.model';
import { Payment } from '../models/payment.model';
import { ApiError } from '../common/utils/api-error';
import { BookingStatus, ListingStatus } from '../common/types';
import { CreateBookingInput, SetAvailabilityInput, BulkAvailabilityInput } from './booking.validator';

export class BookingService {
  async create(userId: string, input: CreateBookingInput) {
    const { listing_id, start_date, end_date, guests } = input;

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (endDate <= startDate) throw ApiError.badRequest('end_date must be after start_date');
    if (startDate < new Date()) throw ApiError.badRequest('start_date cannot be in the past');

    const listing = await Listing.findByPk(listing_id);
    if (!listing) throw ApiError.notFound('Listing not found');
    if (listing.status !== ListingStatus.PUBLISHED) throw ApiError.badRequest('Listing is not available');
    if (guests > listing.max_guests && listing.max_guests > 0) {
      throw ApiError.badRequest(`Max guests for this listing is ${listing.max_guests}`);
    }

    const result = await sequelize.transaction(async (t: Transaction) => {
      const dates = this.getDateRange(start_date, end_date);

      const availabilityRows = await Availability.findAll({
        where: { listing_id, date: dates },
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });

      const availMap = new Map(availabilityRows.map((a) => [a.date, a]));
      let totalAmount = 0;

      for (const date of dates) {
        const avail = availMap.get(date);
        if (!avail) throw ApiError.badRequest(`No availability set for ${date}`);
        if (avail.available_units < 1) throw ApiError.badRequest(`Fully booked on ${date}`);
        totalAmount += Number(avail.price);
      }

      return Booking.create(
        { user_id: userId, listing_id, start_date, end_date, guests, total_amount: totalAmount, status: BookingStatus.PENDING },
        { transaction: t },
      );
    });

    return result;
  }

  async confirm(bookingId: string) {
    return sequelize.transaction(async (t: Transaction) => {
      const booking = await Booking.findByPk(bookingId, {
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });
      if (!booking) throw ApiError.notFound('Booking not found');
      if (booking.status !== BookingStatus.PENDING) throw ApiError.badRequest('Booking is not in pending state');

      const dates = this.getDateRange(booking.start_date, booking.end_date);

      for (const date of dates) {
        const [updated] = await Availability.update(
          { available_units: sequelize.literal('available_units - 1') },
          {
            where: { listing_id: booking.listing_id, date, available_units: sequelize.literal('available_units > 0') },
            transaction: t,
          },
        );
        if (updated === 0) throw ApiError.badRequest(`Overbooking detected for ${date}`);
      }

      await booking.update({ status: BookingStatus.CONFIRMED }, { transaction: t });
      return booking;
    });
  }

  async cancel(userId: string, bookingId: string, reason?: string) {
    return sequelize.transaction(async (t: Transaction) => {
      const booking = await Booking.findByPk(bookingId, {
        lock: Transaction.LOCK.UPDATE,
        transaction: t,
      });
      if (!booking) throw ApiError.notFound('Booking not found');
      if (booking.user_id !== userId) throw ApiError.forbidden('Not your booking');
      if (booking.status === BookingStatus.CANCELLED) throw ApiError.badRequest('Already cancelled');
      if (booking.status === BookingStatus.COMPLETED) throw ApiError.badRequest('Cannot cancel completed booking');

      if (booking.status === BookingStatus.CONFIRMED) {
        const dates = this.getDateRange(booking.start_date, booking.end_date);
        for (const date of dates) {
          await Availability.update(
            { available_units: sequelize.literal('available_units + 1') },
            { where: { listing_id: booking.listing_id, date }, transaction: t },
          );
        }
      }

      await booking.update(
        { status: BookingStatus.CANCELLED, cancellation_reason: reason || null, cancelled_at: new Date() },
        { transaction: t },
      );

      return booking;
    });
  }

  async getById(bookingId: string, userId?: string) {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Listing, attributes: ['id', 'title', 'location', 'price_start'] },
        { model: Payment },
      ],
    });
    if (!booking) throw ApiError.notFound('Booking not found');
    if (userId && booking.user_id !== userId) throw ApiError.forbidden('Not your booking');
    return booking;
  }

  async getUserBookings(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { rows, count } = await Booking.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Listing, attributes: ['id', 'title', 'location'] },
        { model: Payment, attributes: ['id', 'status', 'amount'] },
      ],
    });

    return {
      bookings: rows,
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    };
  }

  async setAvailability(vendorUserId: string, input: SetAvailabilityInput) {
    const vendor = await Vendor.findOne({ where: { user_id: vendorUserId } });
    if (!vendor) throw ApiError.notFound('Vendor not found');

    const listing = await Listing.findOne({ where: { id: input.listing_id, vendor_id: vendor.id } });
    if (!listing) throw ApiError.notFound('Listing not found or not owned by you');

    const [avail] = await Availability.upsert({
      listing_id: input.listing_id,
      date: input.date,
      total_units: input.total_units,
      available_units: input.available_units,
      price: input.price,
    });

    return { availability: avail };
  }

  async setBulkAvailability(vendorUserId: string, input: BulkAvailabilityInput) {
    const vendor = await Vendor.findOne({ where: { user_id: vendorUserId } });
    if (!vendor) throw ApiError.notFound('Vendor not found');

    const listing = await Listing.findOne({ where: { id: input.listing_id, vendor_id: vendor.id } });
    if (!listing) throw ApiError.notFound('Listing not found or not owned by you');

    const dates = this.getDateRange(input.start_date, input.end_date);
    const records = dates.map((date) => ({
      listing_id: input.listing_id,
      date,
      total_units: input.total_units,
      available_units: input.total_units,
      price: input.price,
    }));

    await Availability.bulkCreate(records, {
      updateOnDuplicate: ['total_units', 'available_units', 'price', 'updated_at'],
    });

    return { message: `Availability set for ${dates.length} dates` };
  }

  async getAvailability(listingId: string, startDate: string, endDate: string) {
    const dates = this.getDateRange(startDate, endDate);
    return Availability.findAll({
      where: { listing_id: listingId, date: dates },
      order: [['date', 'ASC']],
    });
  }

  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}

export const bookingService = new BookingService();
