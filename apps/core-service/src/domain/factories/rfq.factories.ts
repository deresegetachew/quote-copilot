import { DateHelper, ID, RFQStatus } from '@common';
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
      newSummary: response?.requestSummary,
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

    // Merge existing items with new items, avoiding duplicates by itemCode
    const existingItems = existingRfq.getItems();
    const mergedItems = [...existingItems];
    
    for (const newItem of newItems) {
      const existingItemIndex = mergedItems.findIndex(
        existing => existing.itemCode === newItem.itemCode
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item with new information
        mergedItems[existingItemIndex] = {
          ...mergedItems[existingItemIndex],
          ...newItem,
          // Combine notes if both exist
          notes: [
            ...(mergedItems[existingItemIndex].notes || []),
            ...(newItem.notes || [])
          ].filter((note, index, arr) => arr.indexOf(note) === index), // Remove duplicates
        };
      } else {
        // Add new item
        mergedItems.push(newItem);
      }
    }

    // Merge notes
    const existingNotes = existingRfq.getNotes() || [];
    const newNotes = additionalNotes || [];
    const mergedNotes = [...existingNotes, ...newNotes]
      .filter((note, index, arr) => arr.indexOf(note) === index); // Remove duplicates

    // Determine the appropriate status for the updated RFQ
    let newStatus = existingRfq.getStatus();
    
    // If the RFQ was previously failed, a follow-up should retry processing
    if (existingRfq.getStatus().getValue() === RFQStatus.PROCESSING_FAILED) {
      newStatus = RFQStatusVO.of(RFQStatus.PROCESSING);
    }

    // Create updated RFQ with preserved ID and timestamps
    const updatedRfq = new RFQEntity({
      id: existingRfq.getStorageId(), // Preserve existing ID
      threadId: existingRfq.getEmailThreadRef(),
      summary: newSummary || existingRfq.getSummary(),
      status: newStatus, // Use the determined status
      customerDetail: existingRfq.getCustomerDetail(),
      expectedDeliveryDate: existingRfq.getExpectedDeliveryDate(),
      hasAttachments: hasAttachments !== null ? hasAttachments : existingRfq.getHasAttachments(),
      notes: mergedNotes.length > 0 ? mergedNotes : null,
      items: mergedItems,
      error: error || existingRfq.getError(),
      reason: reason || existingRfq.getReason(),
      createdAt: existingRfq.getCreatedAt(), // Preserve original creation time
      updatedAt: DateHelper.getNowAsDate(), // Update timestamp
    });

    // Only update status to PROCESSING_FAILED if:
    // 1. There are new errors AND
    // 2. The RFQ is not already in PROCESSING_FAILED status
    if (updatedRfq.hasError() && updatedRfq.getStatus().getValue() !== RFQStatus.PROCESSING_FAILED) {
      updatedRfq.updateStatus(RFQStatusVO.of(RFQStatus.PROCESSING_FAILED));
    }

    return updatedRfq;
  }
}
