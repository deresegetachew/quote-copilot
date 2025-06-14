import { buildSubject } from '../../subjects.helper';

export const messageParsedSubject = buildSubject({
  context: 'message',
  entity: 'parsing',
  event: 'parsed',
}); 