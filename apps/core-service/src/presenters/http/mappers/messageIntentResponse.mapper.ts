import { MessageIntentResponseDTO } from '@common';
import { TEmailIntentSchemaType } from '@tools-langchain';

export type ToResponseParams = {
  llmResponse: TEmailIntentSchemaType;
};

export class MessageIntentResponseMapper {
  static toResponse({
    llmResponse,
  }: ToResponseParams): MessageIntentResponseDTO {
    return {
      threadId: llmResponse.threadId,
      summary: llmResponse.requestSummary ?? '',
      isRFQ: llmResponse.isRFQ,
      reason: llmResponse.reason,
      error: llmResponse.error
        ? {
            message: llmResponse.error?.message ?? null,
            obj: llmResponse.error?.obj ?? null,
          }
        : null,
      rfqData: {
        customerDetail: llmResponse.customerDetail
          ? {
              name: llmResponse.customerDetail?.name ?? null,
              email: llmResponse.customerDetail?.email,
            }
          : null,
        expectedDeliveryDate: llmResponse.expectedDeliveryDate ?? null,
        hasAttachments: llmResponse.hasAttachments ?? null,
        notes: llmResponse.notes ?? null,
        items: llmResponse.items
          ? llmResponse.items?.map((item) => ({
              itemCode: item.itemCode,
              itemDescription: item.itemDescription ?? null,
              quantity: item.quantity,
              unit: item.unit ?? null,
              notes: item.notes ?? null,
            }))
          : null,
      },
    };
  }
}
