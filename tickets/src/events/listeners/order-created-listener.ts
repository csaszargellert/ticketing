import {
  Listener,
  OrderCreatedEvent,
  Subjects,
  NotFoundError,
} from '@gellert-ticketing/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './order-queue-group';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { Ticket } from '../../models/ticket-model';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    ticket.set({ orderId: data.id });
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
