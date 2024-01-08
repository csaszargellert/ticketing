import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@gellert-ticketing/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order-model';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      userId: data.userId,
      price: data.ticket.price,
      status: data.status,
      id: data.id,
      version: data.version,
    });
    await order.save();

    msg.ack();
  }
}
