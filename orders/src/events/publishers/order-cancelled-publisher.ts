import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@gellert-ticketing/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
