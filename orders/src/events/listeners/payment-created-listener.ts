import {
  Listener,
  Subjects,
  OrderStatus,
  PaymentCreatedEvent,
} from '@gellert-ticketing/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './ticket-queue-group';

import { Order } from '../../models/order-model';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
