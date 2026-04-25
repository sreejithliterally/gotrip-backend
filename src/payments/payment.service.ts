import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/payment.model';
import { Booking } from '../models/booking.model';
import { bookingService } from '../bookings/booking.service';
import { ApiError } from '../common/utils/api-error';
import { config } from '../common/config';
import { PaymentStatus, BookingStatus } from '../common/types';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export class PaymentService {
  async createOrder(userId: string, bookingId: string) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.user_id !== userId) throw ApiError.forbidden('Not your booking');
    if (booking.status !== BookingStatus.PENDING) throw ApiError.badRequest('Booking is not in pending state');

    const existingPayment = await Payment.findOne({ where: { booking_id: bookingId } });
    if (existingPayment && existingPayment.status === PaymentStatus.CAPTURED) {
      throw ApiError.badRequest('Payment already completed');
    }

    const order = await razorpay.orders.create({
      amount: Math.round(Number(booking.total_amount) * 100),
      currency: 'INR',
      receipt: `bk_${bookingId.replace(/-/g, '')}`.slice(0, 40),
      notes: { booking_id: bookingId, user_id: userId },
    });

    if (existingPayment) {
      await existingPayment.update({ razorpay_order_id: order.id, amount: booking.total_amount, status: PaymentStatus.CREATED });
    } else {
      await Payment.create({
        booking_id: bookingId,
        razorpay_order_id: order.id,
        amount: booking.total_amount,
        currency: 'INR',
        status: PaymentStatus.CREATED,
      });
    }

    return { order_id: order.id, amount: order.amount, currency: order.currency, key_id: config.razorpay.keyId };
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) throw ApiError.badRequest('Invalid payment signature');

    const payment = await Payment.findOne({ where: { razorpay_order_id } });
    if (!payment) throw ApiError.notFound('Payment not found');

    await payment.update({ razorpay_payment_id, razorpay_signature, status: PaymentStatus.CAPTURED });
    await bookingService.confirm(payment.booking_id);

    return payment;
  }

  async handleWebhook(body: any, signature: string) {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) throw ApiError.badRequest('Invalid webhook signature');

    const event = body.event;
    const payload = body.payload;

    if (event === 'payment.captured') {
      const rpPayment = payload.payment.entity;
      const payment = await Payment.findOne({ where: { razorpay_order_id: rpPayment.order_id } });
      if (!payment) return { status: 'ignored', reason: 'payment not found' };
      if (payment.status === PaymentStatus.CAPTURED) return { status: 'already_processed' };

      await payment.update({ razorpay_payment_id: rpPayment.id, status: PaymentStatus.CAPTURED, webhook_payload: body });
      await bookingService.confirm(payment.booking_id);
      return { status: 'processed' };
    }

    if (event === 'payment.failed') {
      const rpPayment = payload.payment.entity;
      const payment = await Payment.findOne({ where: { razorpay_order_id: rpPayment.order_id } });
      if (payment) await payment.update({ status: PaymentStatus.FAILED, webhook_payload: body });
      return { status: 'processed' };
    }

    return { status: 'ignored', reason: `unhandled event: ${event}` };
  }
}

export const paymentService = new PaymentService();
