import {
  Publisher,
  PaymentCreatedEvent,
  Subjects,
} from '@gellert-ticketing/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
