export type TParseEmailActivityResponse = {
  summary: string;
  isRFQ: boolean;
  reason: string;
  error: { message: string; obj: any } | null;
  rfqData: {
    customerDetail: {
      name: string | null;
      email: string;
    } | null;
    expectedDeliveryDate: string | null;
    hasAttachments: boolean | null;
    items:
      | {
          itemCode: string;
          itemDescription: string | null;
          quantity: number;
          unit: string | null;
          notes: string | null;
        }[]
      | null;
  };
};
