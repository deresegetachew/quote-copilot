import { Injectable } from '@nestjs/common';
import { AbstractPromptBuilder } from './promptBuilder.abstract';
import { PromptKeys } from '.';
import { ParseCustomerRFQEmailPromptBuilder } from './llmPrompts/builder/parseCustomerRFQEmailPromptBuilder';

@Injectable()
export class PromptFactory {
  private readonly builders: Map<string, AbstractPromptBuilder<unknown>>;

  constructor(
    private readonly procurementConfirmationBuilder: ParseCustomerRFQEmailPromptBuilder,
    // Add other builders here
  ) {
    this.builders = new Map<string, AbstractPromptBuilder<unknown>>([
      [
        PromptKeys.PARSE_CUSTOMER_RFQ_EMAIL,
        this.procurementConfirmationBuilder,
      ],
      // Add other mappings here
    ]);
  }

  //TODO: in the future we can take in tennant Id and return the builder for that specific tenant from db
  getBuilder(promptKey: string): AbstractPromptBuilder<unknown> {
    const builder = this.builders.get(promptKey);
    if (!builder) {
      throw new Error(`No builder found for promptKey: ${promptKey}`);
    }
    return builder;
  }
}
