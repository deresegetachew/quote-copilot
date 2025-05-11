import { TParseEmailIntentState } from '@tools-langchain';
import { TParseEmailActivityResponse } from './type';

export class ParseEmailIntentActivityMapper {
  static from(
    llmResponse: TParseEmailIntentState,
  ): TParseEmailActivityResponse {
    const { summary, isRFQ, reason, rfqData, error, messages } = llmResponse;

    return {
      summary,
      isRFQ,
      reason,
      rfqData,
      error: error ? { message: error.message, obj: error.obj } : null,
      messages,
    };
  }
}
