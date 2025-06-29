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

  const [integration, subject, eventType] = parts;
  return { subject, eventType };
}

// Wildcard-safe builders
