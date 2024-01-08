import {
  Listener,
  Subjects,
  TicketUpdatedEvent,
} from '@gellert-ticketing/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './ticket-queue-group';

import { Ticket } from '../../models/ticket-model';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent({
      id: data.id,
      version: data.version,
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { price, title, version } = data;

    ticket.set({ price, title, version });
    await ticket.save();

    msg.ack();
  }
}
