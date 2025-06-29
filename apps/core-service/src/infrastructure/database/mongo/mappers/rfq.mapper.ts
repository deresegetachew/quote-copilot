import { ObjectId } from 'bson';
import { RFQDocument } from '../schemas/rfq.schema';
import { DateHelper, ID } from '@common';
import { RFQStatusVO } from '../../../../domain/valueObjects/rfqStatus.vo';
import { RFQAggregate } from '../../../../domain/entities/RFQ.aggregate';
import { RFQLineItemEntity } from '../../../../domain/entities/RFQLineItem.entity';

export class RFQMapper {
  // Domain to Persistence
  static toPersistenceRFQ(rfq: RFQAggregate): Partial<RFQDocument> {
    return {
      id: rfq.getStorageId().toString(),
      threadId: rfq.getEmailThreadRef(),
      summary: rfq.summary || undefined,
      status: rfq.status.getValue(),
      customerDetail: rfq.customerDetail || undefined,
      expectedDeliveryDate: rfq.expectedDeliveryDate,
      hasAttachments: rfq.hasAttachments,
      notes: rfq.notes,
      error: rfq.error,
      reason: rfq.reason,
      createdAt: rfq.createdAt,
      updatedAt: rfq.updatedAt,
    };
  }

  // Persistence to Domain
  static toDomainAggregate(
    rfqDoc: Omit<RFQDocument, 'lineItems'>,
    lineItems: RFQDocument['lineItems'] = [],
  ): RFQAggregate {
    // Create aggregate with required props
    const rfqAgg = new RFQAggregate({
      id: ID.of(rfqDoc.id),
      threadId: rfqDoc.threadId,
      status: RFQStatusVO.of(rfqDoc.status),
    });

    // Set optional properties using fluent interface
    rfqAgg
      .setRFQSummary(rfqDoc.summary)
      .setCustomerDetail({
        name: rfqDoc.customerDetail?.name || null,
        email: rfqDoc.customerDetail?.email || '',
      })
      .setExpectedDeliveryDate(
        rfqDoc.expectedDeliveryDate
          ? DateHelper.toUTCDateTime(rfqDoc.expectedDeliveryDate)
          : null,
      )
      .setHasAttachments(rfqDoc.hasAttachments || false)
      .setNotes(rfqDoc.notes || null)
      .setReason(rfqDoc.reason || null)
      .setError(rfqDoc.error || null)
      .setCreatedAt(rfqDoc.createdAt)
      .setUpdatedAt(rfqDoc.updatedAt);

    // Map line items
    lineItems.forEach((item) => {
      const lineItem = new RFQLineItemEntity(
        ID.of(item._id),
        item.itemCode,
        item.quantity || 0,
      );

      // Set optional properties (removed redundant || null)
      lineItem.description = item.itemDescription;
      lineItem.unit = item.unit;

      // Add notes if they exist
      item.notes?.forEach((note) => {
        if (note) {
          // Only add non-null/empty notes
          lineItem.addNote(note);
        }
      });

      rfqAgg.addRFQLineItem(lineItem);
    });

    return rfqAgg;
  }
}
