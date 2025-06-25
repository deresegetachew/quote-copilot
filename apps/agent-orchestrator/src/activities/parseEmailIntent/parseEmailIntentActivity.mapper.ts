import { TParseEmailActivityResponse } from './type';
import { TMessageIntentResponseDTO } from '@common';

export class ParseEmailIntentActivityMapper {
  static from(
    messageIntent: TMessageIntentResponseDTO,
  ): TParseEmailActivityResponse {
    return {
      summary: messageIntent.summary,
      isRFQ: messageIntent.isRFQ ?? false,
      reason: messageIntent.reason ?? '',
      error: messageIntent.error,
      rfqData: messageIntent.rfqData,
    };
  }
}
