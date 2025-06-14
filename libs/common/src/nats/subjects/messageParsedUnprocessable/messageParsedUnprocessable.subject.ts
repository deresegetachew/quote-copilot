import { buildSubject } from '../../subjects.helper';

export const messageParsedUnprocessableSubject = buildSubject({
  context: 'message',
  entity: 'parsing',
  event: 'unprocessable',
}); 