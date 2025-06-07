export type SubjectComponents = {
  source: string;
  eventType: string;
};

export function buildTopic({ source, eventType }: SubjectComponents): string {
  return `integration.${source}.${eventType}`;
}

export function topicFilterForSource(source: string): string {
  return `integration.${source}.*`;
}

export function topicFilterForEventType(event: string): string {
  return `integration.*.${event}`;
}

export function parseTopic(subject: string): SubjectComponents | null {
  const parts = subject.split('.');
  if (parts.length !== 3) return null;

  const [integration, source, eventType] = parts;
  return { source, eventType };
}

// Wildcard-safe builders
