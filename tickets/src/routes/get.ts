import express, { Request, Response } from 'express';
import { NotFoundError } from '@gellert-ticketing/common';

import { Ticket } from '../models/ticket-model';

const router = express.Router();

router.get('/api/tickets/:ticketId', async (req: Request, res: Response) => {
  const { ticketId } = req.params;

  const existingTicket = await Ticket.findById(ticketId);

  if (!existingTicket) {
    throw new NotFoundError();
  }

  res.status(200).send(existingTicket);
});

export { router as getTicketRoute };
