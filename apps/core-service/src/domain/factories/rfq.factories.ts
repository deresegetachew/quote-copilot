import { DateHelper, ID, RFQStatus } from '@common';
import { RFQEntity } from '../entities/RFQ.entity';
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
    id: ID;
    itemCode: string;
    itemDescription: string | null;
    quantity: number;
    unit: string | null;
    notes: string[] | null;
  }>;
};

type TUpdateExistingParams = {
  existingRfq: RFQEntity;
  newItems?: Array<{
    itemCode: string;
    itemDescription: string | null;
    quantity: number;
    unit: string | null;
    notes: string[] | null;
  }>;
  additionalNotes?: string[] | null;
  newSummary?: string;
  hasAttachments?: boolean | null;
  error?: string[] | null;
  reason?: string | null;
};

export class RfqFactory {
  static crateFromEmailIntentResponse(
    response: TEmailIntentSchemaType,
  ): RFQEntity {
    return RfqFactory.createNew({
      threadId: response?.threadId,
      summary: response?.requestSummary || '',
      expectedDeliveryDate: response?.expectedDeliveryDate
        ? DateHelper.toUTCDateTime(response.expectedDeliveryDate)
        : null,
      hasAttachments: response.hasAttachments || null,
      customerDetail: {
        name: response?.customerDetail?.name || null,
        email: response?.customerDetail?.email || '',
      },
      error: response?.error,
      notes: response?.notes || null,
      reason: response?.reason || null,
      items: response?.items
        ? response.items?.map((item) => ({
            id: ID.create(),
            itemCode: item?.itemCode,
            itemDescription: item?.itemDescription || null,
            quantity: item?.quantity,
            unit: item?.unit || null,
            notes: item?.notes || null,
          }))
        : [],
    });
  }

  static updateExistingFromEmailIntentResponse(
    existingRfq: RFQEntity,
    response: TEmailIntentSchemaType,
  ): RFQEntity {
    const newItems = response?.items
      ? response.items?.map((item) => ({
          itemCode: item?.itemCode,
          itemDescription: item?.itemDescription || null,
          quantity: item?.quantity,
          unit: item?.unit || null,
          notes: item?.notes || null,
        }))
      : [];

    return RfqFactory.updateExisting({
      existingRfq,
      newItems,
      additionalNotes: response?.notes || null,
      newSummary: response?.requestSummary || undefined,
      hasAttachments: response.hasAttachments || null,
      error: response?.error,
      reason: response?.reason || null,
    });
  }

  static createNew(params: TCreateNewParams): RFQEntity {
    const { threadId, summary, customerDetail, error = null, items } = params;

    const rfq = new RFQEntity({
      id: ID.create(),
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

  static updateExisting(params: TUpdateExistingParams): RFQEntity {
    const { existingRfq, newItems = [], additionalNotes, newSummary, hasAttachments, error, reason } = params;

    // Merge existing and new items
    const mergedItems = [...existingRfq.getItems()];
    
    if (newItems && newItems.length > 0) {
      for (const newItem of newItems) {
        // Add id property to new items
        const itemWithId = {
          id: ID.create(),
          itemCode: newItem.itemCode,
          itemDescription: newItem.itemDescription,
          quantity: newItem.quantity,
          unit: newItem.unit,
          notes: newItem.notes,
        };
        mergedItems.push(itemWithId);
      }
    }

    return new RFQEntity({
      id: ID.of(existingRfq.getStorageId()), // Preserve existing ID with proper conversion
      threadId: existingRfq.getEmailThreadRef(),
      summary: newSummary || existingRfq.getSummary(),
      status: existingRfq.getStatus(),
      customerDetail: existingRfq.getCustomerDetail(),
      expectedDeliveryDate: existingRfq.getExpectedDeliveryDate(),
      hasAttachments: hasAttachments !== undefined ? hasAttachments : existingRfq.getHasAttachments(),
      notes: [...(existingRfq.getNotes() || []), ...(additionalNotes || [])],
      items: mergedItems,
      error: error || null,
      reason: reason || null,
      createdAt: existingRfq.getCreatedAt(),
      updatedAt: DateHelper.getNowAsDate(),
    });
  }
}
