import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import {
  validate,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@gellert-ticketing/common';

import { Ticket } from '../models/ticket-model';
import { Order } from '../models/order-model';
import natsWrapper from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOW_IN_SECONDS = 15 * 60;

router.post(
  '/api/orders',
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Ticked ID is not valid'),
  ],
  validate,
  async function (req: Request, res: Response) {
    // check if ticket exists
    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // check status, and if it is not cancelled then the ticket is preserved, so we cannot process the order
    const isReserved = await ticket!.isReserved();

    if (isReserved) {
      throw new BadRequestError('Ticket has already been reserved');
    }

    // calculate expiration date for the order
    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + EXPIRATION_WINDOW_IN_SECONDS
    );

    // build the order
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });
    await order.save();

    // publish the order:created event
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      userId: req.currentUser!.id,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
      version: order.version,
      status: order.status,
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
