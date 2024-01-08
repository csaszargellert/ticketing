import express, { Request, Response } from 'express';
import {
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@gellert-ticketing/common';

import { Order } from '../models/order-model';
import natsWrapper from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  async function (req: Request, res: Response) {
    const existingOrder = await Order.findById(req.params.orderId).populate(
      'ticket'
    );

    if (!existingOrder) {
      throw new NotFoundError();
    }
    if (existingOrder.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    existingOrder.status = OrderStatus.Cancelled;
    await existingOrder.save();

    // publish cancelled event

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: existingOrder.id,
      ticket: {
        id: existingOrder.ticket.id,
      },
      version: existingOrder.version,
    });

    res.status(204).send(existingOrder);
  }
);

export { router as cancelOrderRouter };
