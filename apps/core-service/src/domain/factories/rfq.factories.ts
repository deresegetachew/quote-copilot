import { DateHelper, RFQStatus } from '@common';
import { RFQEntity } from '../entities/rfq.entity';
import { RFQStatusVO } from '../valueObjects/rfqStatus.vo';
import { TEmailIntentSchemaType } from '@tools-langchain'; //this is a library we dont have dep on langchain just schema

type TCreateNewParams = {
  threadId: string;
  summary: string;
  customerDetail: { name: string | null; email: string };
  expectedDeliveryDate?: Date | null;
  notes?: string[] | null;
  reason?: string | null;
  hasAttachments?: boolean | null;
  error?: string[] | null;
  items: Array<{
    itemCode: string;
    itemDescription: string | null;
    quantity: number;
    unit: string | null;
    notes: string[] | null;
  }>;
};

export class RfqFactory {
  static crateFromEmailIntentResponse(
    response: TEmailIntentSchemaType,
  ): RFQEntity {
    return RfqFactory.createNew({
      threadId: response?.threadId,
      summary: response?.requestSummary,
      expectedDeliveryDate: response?.expectedDeliveryDate
        ? DateHelper.toUTCDateTime(response.expectedDeliveryDate)
        : null,
      hasAttachments: response.hasAttachments || null,
      customerDetail: {
        name: response?.customerDetail?.name || null,
        email: response?.customerDetail?.email,
      },
      error: response?.error,
      notes: response?.notes || null,
      reason: response?.reason || null,
      items: response?.items
        ? response.items?.map((item) => ({
            itemCode: item?.itemCode,
            itemDescription: item?.itemDescription || null,
            quantity: item?.quantity,
            unit: item?.unit || null,
            notes: item?.notes || null,
          }))
        : [],
    });
  }

  static createNew(params: TCreateNewParams): RFQEntity {
    const { threadId, summary, customerDetail, error = null, items } = params;

    const rfq = new RFQEntity({
      id: undefined, // ID will be set in infrastructure layer
      threadId,
      summary,
      status: RFQStatusVO.initial(),
      customerDetail,
      expectedDeliveryDate: null,
      hasAttachments: null,
      notes: null,
      items,
      error: error,
      reason: params.reason || null,
      createdAt: DateHelper.getNowAsDate(),
      updatedAt: DateHelper.getNowAsDate(),
    });

    if (rfq.hasError()) {
      rfq.updateStatus(RFQStatusVO.of(RFQStatus.PROCESSING_FAILED));
    }

    return rfq;
  }
}
