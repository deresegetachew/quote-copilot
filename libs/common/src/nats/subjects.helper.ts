export interface SubjectComponents {
  tenant?: string;
  context: string;
  entity: string;
  event: string;
}

export function buildSubject(components: SubjectComponents): string {
  const { tenant = 'default', context, entity, event } = components;
  return `${tenant}.${context}.${entity}.${event}`;
} 