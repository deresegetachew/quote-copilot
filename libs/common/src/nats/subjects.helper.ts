export type SubjectComponents = {
  tenant?: string;
  context: string;
  entity: string;
  event: string;
};

export function buildSubject({
  tenant = 'default',
  context,
  entity,
  event,
}: SubjectComponents): string {
  return `${tenant}.${context}.${entity}.${event}`;
}

// Example usage:
// const subject = buildSubject({
//   tenant: 'xyz',
//   context: 'rfq',
//   entity: 'thread',
//   event: 'parsed'
// });
// -> "xyz.rfq.thread.parsed"

export function parseSubject(subject: string): SubjectComponents | null {
  const parts = subject.split('.');
  if (parts.length !== 4) return null;

  const [tenant, context, entity, event] = parts;
  return { tenant, context, entity, event };
}

// Wildcard-safe builders
export function subjectFilterForTenant(tenant: string): string {
  return `${tenant}.*.*.*`;
}

export function subjectFilterForEntity(entity: string): string {
  return `*.*.${entity}.*`;
}

export function subjectFilterForEvent(event: string): string {
  return `*.*.*.${event}`;
}

export function subjectFilterForContext(context: string): string {
  return `*.${context}.*.*`;
}
