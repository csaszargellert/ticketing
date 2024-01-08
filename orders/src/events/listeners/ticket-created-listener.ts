import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from '@gellert-ticketing/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket-model';

import { QUEUE_GROUP_NAME } from './ticket-queue-group';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const ticket = Ticket.build({
      id: data.id,
      title: data.title,
      price: data.price,
      version: data.version,
    });
    await ticket.save();

    msg.ack();
  }
}
