import { Injectable } from '@nestjs/common';
import { AbstractPromptBuilder } from './promptBuilder.abstract';
import { PromptKeys } from '.';
import { ProcurementConfirmationPromptBuilder } from './llmPrompts/procurement/confirmation/builder/procurementConfirmationPromptBuilder';

@Injectable()
export class PromptFactory {
  private readonly builders: Map<string, AbstractPromptBuilder>;

  constructor(
    private readonly procurementConfirmationBuilder: ProcurementConfirmationPromptBuilder,
    // Add other builders here
  ) {
    this.builders = new Map<string, AbstractPromptBuilder>([
      [PromptKeys.CONFIRMATION, this.procurementConfirmationBuilder],
      // Add other mappings here
    ]);
  }

  //TODO: in the future we can take in tennant Id and return the builder for that specific tenant from db
  getBuilder(promptKey: string): AbstractPromptBuilder {
    const builder = this.builders.get(promptKey);
    if (!builder) {
      throw new Error(`No builder found for promptKey: ${promptKey}`);
    }
    return builder;
  }
}
