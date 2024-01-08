import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@gellert-ticketing/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
