import { Injectable } from '@nestjs/common';
import { AbstractPromptBuilder } from './promptBuilder.abstract';
import {
  ClassifyMessageAsRFQPromptBuilder,
  ExtractRFQDetailsPromptBuilder,
  PromptKeys,
  SummarizeMessagePromptBuilder,
} from '.';

// TO REMOVE:
@Injectable()
export class PromptFactory {
  private readonly builders: Map<string, AbstractPromptBuilder<any>>;

  constructor(
    private readonly classifyMsgAsRFQBuilder: ClassifyMessageAsRFQPromptBuilder,
    private readonly summarizeMessagesBuilder: SummarizeMessagePromptBuilder,
    private readonly extractRFQDetailsBuilder: ExtractRFQDetailsPromptBuilder,
  ) {
    this.builders = new Map<string, AbstractPromptBuilder<any>>([
      [PromptKeys.EXTRACT_RFQ_DETAILS, this.extractRFQDetailsBuilder],
      [PromptKeys.SUMMARIZE_MESSAGE, this.summarizeMessagesBuilder],
      [PromptKeys.CLASSIFY_MESSAGE_AS_RFQ, this.classifyMsgAsRFQBuilder],
      // Add other mappings here
    ]);
  }

  //TODO: in the future we can take in tennant Id and return the builder for that specific tenant from db
  getBuilder(promptKey: PromptKeys): AbstractPromptBuilder<any> {
    const builder = this.builders.get(promptKey);
    if (!builder) {
      throw new Error(`No builder found for promptKey: ${promptKey}`);
    }
    return builder;
  }
}
