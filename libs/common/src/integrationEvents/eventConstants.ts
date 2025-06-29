export const EvtAttachmentParseRequested = 'attachment-parse-requested';

export const IntegEvtSubjects = {
  email: 'email',
} as const;

export type TIntegEvtSubj =
  (typeof IntegEvtSubjects)[keyof typeof IntegEvtSubjects];

export const IntegEvtKeys = {
  sendRfqReceivedConfirmation: 'send-rfq-received-confirmation',

  parseAttachment: 'parse-attachment',
} as const;

export type TIntegEvts = (typeof IntegEvtKeys)[keyof typeof IntegEvtKeys];
