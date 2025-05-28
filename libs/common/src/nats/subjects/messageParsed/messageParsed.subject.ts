import { buildSubject } from '../../subjects.helper';

export const messageParsedSubject = buildSubject({
  context: 'rfq',
  entity: 'message',
  event: 'unprocessable',
});
