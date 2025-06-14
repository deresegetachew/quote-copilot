import { buildSubject } from '../../subjects.helper';

export const messageParsedWithErrorSubject = buildSubject({
  tenant: 'default',
  context: 'rfq',
  entity: 'message',
  event: 'parsedWithError',
});
