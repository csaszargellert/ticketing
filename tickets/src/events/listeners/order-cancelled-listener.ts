import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  NotFoundError,
} from '@gellert-ticketing/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './order-queue-group';

import { Ticket } from '../../models/ticket-model';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    ticket.orderId = undefined;
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    msg.ack();
  }
}
