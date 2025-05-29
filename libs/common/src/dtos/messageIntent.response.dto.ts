export class MessageIntentResponseDTO {
  threadId: string;
  summary: string;
  isRFQ: boolean | null;
  reason: string | null;
  error: string[] | null;
  rfqData: {
    customerDetail: {
      name: string | null;
      email: string;
    } | null;
    expectedDeliveryDate: string | null;
    hasAttachments: boolean | null;
    notes: string[] | null;
    items:
      | {
          itemCode: string;
          itemDescription: string | null;
          quantity: number;
          unit: string | null;
          notes: string[] | null;
        }[]
      | null;
  };
}
