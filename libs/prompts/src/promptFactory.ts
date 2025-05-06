// import { Injectable } from '@nestjs/common';
// import { AbstractPromptBuilder } from './promptBuilder.abstract';
// import { PromptKeys, SummarizeMessagePromptBuilder } from '.';
// import { ParseCustomerRFQEmailPromptBuilder } from './llmPrompts/builder/parseCustomerRFQEmail.promptBuilder';

// @Injectable()
// export class PromptFactory {
//   private readonly builders: Map<string, AbstractPromptBuilder<unknown>>;

//   constructor(
//     private readonly procurementConfirmationBuilder: ParseCustomerRFQEmailPromptBuilder,
//     private readonly summarizeMessagesBuilder: SummarizeMessagePromptBuilder,

//     // Add other builders here
//   ) {
//     this.builders = new Map<string, AbstractPromptBuilder<unknown>>([
//       [
//         PromptKeys.PARSE_CUSTOMER_RFQ_EMAIL,
//         this.procurementConfirmationBuilder,
//       ],
//       [PromptKeys.SUMMARIZE_MESSAGE, this.summarizeMessagesBuilder],
//       // Add other mappings here
//     ]);
//   }

//   //TODO: in the future we can take in tennant Id and return the builder for that specific tenant from db
//   getBuilder(promptKey: PromptKeys): AbstractPromptBuilder<unknown> {
//     const builder = this.builders.get(promptKey);
//     if (!builder) {
//       throw new Error(`No builder found for promptKey: ${promptKey}`);
//     }
//     return builder;
//   }
// }
