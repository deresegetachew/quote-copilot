import { buildSubject } from '../../subjects.helper';

export const messageParsedWithErrorSubject = buildSubject({
  context: 'rfq',
  entity: 'message',
  event: 'parsedWithError',
});
