import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@gellert-ticketing/common';
import { Message } from 'node-nats-streaming';

import { QUEUE_GROUP_NAME } from './queue-group-name';
import { expirationQueue } from '../../queue-jobs';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add({ orderId: data.id }, { delay: 30000 });

    msg.ack();
  }
}
