import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validate,
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
  OrderStatus,
} from '@gellert-ticketing/common';

import { Order } from '../models/order-model';
import { stripe } from '../stripe';
import { Payment } from '../models/payment-model';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import natsWrapper from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payment',

  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validate,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.body.orderId);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Order is cancelled');
    }

    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'usd',
      source: req.body.token,
    });

    const payment = Payment.build({
      orderId: req.body.orderId,
      stripeId: charge.id,
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createPaymentRouter };
