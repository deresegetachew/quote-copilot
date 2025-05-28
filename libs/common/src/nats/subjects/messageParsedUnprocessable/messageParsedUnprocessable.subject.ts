import { buildSubject } from '../../subjects.helper';

export const messageParsedUnprocessableSubject = buildSubject({
  context: 'rfq',
  entity: 'message',
  event: 'unprocessable',
});
