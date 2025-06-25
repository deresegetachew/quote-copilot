import { TEmailIntentResponseDTO, TMessageIntentResponseDTO } from '@common';

export type ToResponseParams = {
  llmResponse: TEmailIntentResponseDTO;
};

export class MessageIntentResponseMapper {
  static toResponse({
    llmResponse,
  }: ToResponseParams): TMessageIntentResponseDTO {
    return {
      threadId: llmResponse.storageThreadID,
      summary: llmResponse.requestSummary ?? '',
      isRFQ: llmResponse.isRFQ,
      reason: llmResponse.reason,
      error: llmResponse.error,
      rfqData: {
        customerDetail: llmResponse.customerDetail
          ? {
              name: llmResponse.customerDetail?.name ?? null,
              email: llmResponse.customerDetail?.email || '',
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
