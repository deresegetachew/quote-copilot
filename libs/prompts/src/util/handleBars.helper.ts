import Handlebars from 'handlebars';

export function renderTemplate(
  template: string,
  variables: Record<string, any>,
): string {
  const compiled = Handlebars.compile(template, { noEscape: true });
  return compiled(variables);
}
