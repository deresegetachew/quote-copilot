import { buildSubject } from '../../subjects.helper';

export const rfqConfirmationEmailRequestedSubject = buildSubject({
  context: 'rfq',
  entity: 'email',
  event: 'confirmationRequested',
}); 