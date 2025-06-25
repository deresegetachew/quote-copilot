import { TIntegEvtSubj, TIntegEvts } from './eventConstants';

export type TEvtTopic = {
  subject: TIntegEvtSubj;
  topic: TIntegEvts;
};

export function buildTopic({ subject, topic: eventType }: TEvtTopic): string {
  return `integration.${subject}.${eventType}`;
}

export function topicFilterForSource(subject: string): string {
  return `integration.${subject}.*`;
}

export function topicFilterForEventType(event: string): string {
  return `integration.*.${event}`;
}

export function parseTopic(topicTxt: string): TEvtTopic | null {
  const parts = topicTxt.split('.');
  if (parts.length !== 3) return null;

  const [subject, eventType] = parts;
  return { subject: subject as TIntegEvtSubj, topic: eventType as TIntegEvts };
}

// Wildcard-safe builders
