import {
  Listener,
  OrderCancelledEvent,
  Subjects,
  OrderStatus,
} from '@gellert-ticketing/common';
import { Message } from 'node-nats-streaming';

import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order-model';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByEvent({
      version: data.version,
      id: data.id,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled, version: data.version });
    await order.save();

    msg.ack();
  }
}
