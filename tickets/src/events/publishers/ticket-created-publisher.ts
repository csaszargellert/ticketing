import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@gellert-ticketing/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
