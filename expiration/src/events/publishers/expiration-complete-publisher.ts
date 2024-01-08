import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@gellert-ticketing/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
