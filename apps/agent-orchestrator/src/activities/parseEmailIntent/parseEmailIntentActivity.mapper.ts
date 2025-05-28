import { TEmailIntentSchemaType } from '@tools-langchain';
import { TParseEmailActivityResponse } from './type';
import { MessageIntentResponseDTO } from '@common';

export class ParseEmailIntentActivityMapper {
  static from(
    messageIntent: MessageIntentResponseDTO,
  ): TParseEmailActivityResponse {
    return {
      summary: messageIntent.summary,
      isRFQ: messageIntent.isRFQ,
      reason: messageIntent.reason,
      error: messageIntent.error,
      rfqData: messageIntent.rfqData,
    };
  }
}
