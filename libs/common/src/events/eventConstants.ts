export const EvtAttachmentParseRequested = 'attachment-parse-requested';

export const IntegEvtSubjects = {
  email: 'email',
} as const;

export type TIntegEvtSubj =
  (typeof IntegEvtSubjects)[keyof typeof IntegEvtSubjects];

export const IntegEvtKeys = {
  parseAttachment: 'parse-attachment',
  rfqParsed: 'rfq-parsed',
  attachmentParseRequested: 'attachment-parsing-requested',
} as const;

export type TIntegEvts = (typeof IntegEvtKeys)[keyof typeof IntegEvtKeys];
