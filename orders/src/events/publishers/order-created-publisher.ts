import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@gellert-ticketing/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
