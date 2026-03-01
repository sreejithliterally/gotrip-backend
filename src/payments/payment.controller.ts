import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess } from '../common/utils/response';
import { AuthenticatedRequest } from '../common/types';

export class PaymentController {
  async createOrder(req: AuthenticatedRequest, res: Response) {
    const { booking_id } = req.body;
    const order = await paymentService.createOrder(req.user!.id, booking_id);
    return sendSuccess(res, order, 'Razorpay order created');
  }

  async verifyPayment(req: Request, res: Response) {
    const result = await paymentService.verifyPayment(req.body);
    return sendSuccess(res, result, 'Payment verified');
  }

  async webhook(req: Request, res: Response) {
    const signature = req.headers['x-razorpay-signature'] as string;
    const result = await paymentService.handleWebhook(req.body, signature);
    return sendSuccess(res, result, 'Webhook processed');
  }
}

export const paymentController = new PaymentController();
