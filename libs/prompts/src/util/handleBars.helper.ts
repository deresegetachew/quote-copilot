import Handlebars from 'handlebars';
import * as fs from 'fs/promises';

export async function renderTemplateOrThrow(
  templatePath: string,
  variables: Record<string, any>,
): Promise<string> {
  try {
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiled = Handlebars.compile(templateContent, { noEscape: true });
    return compiled(variables);
  } catch (error) {
    throw new Error(
      `Error building handlebars template at path: ${templatePath}`,
    );
  }
}
