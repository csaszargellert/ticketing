import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  validate,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from '@gellert-ticketing/common';

import natsWrapper from '../nats-wrapper';
import { Ticket } from '../models/ticket-model';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
  '/api/tickets/:ticketId',
  requireAuth,
  [
    body('title').trim().not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greate than 0'),
  ],
  validate,
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;

    const existingTicket = await Ticket.findById(ticketId);

    if (!existingTicket) {
      throw new NotFoundError();
    }

    if (existingTicket.orderId) {
      throw new BadRequestError(
        'Ticket cannot be modified whilst being reserved'
      );
    }

    const userId = req.currentUser.id;

    if (existingTicket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    const { title, price } = req.body;

    existingTicket.set({ title, price });
    await existingTicket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: existingTicket.id,
      userId: existingTicket.userId,
      title: existingTicket.title,
      price: existingTicket.price,
      version: existingTicket.version,
    });

    res.status(201).send(existingTicket);
  }
);

export { router as editTicketRoute };
