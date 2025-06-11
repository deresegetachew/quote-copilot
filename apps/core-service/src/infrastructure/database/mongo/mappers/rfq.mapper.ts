import { ObjectId } from 'bson';
import { RFQEntity } from '../../../../domain/entities/rfq.entity';
import { RFQDocument } from '../schemas/rfq.schema';
import { DateHelper, ID } from '@common';
import { RFQStatusVO } from '../../../../domain/valueObjects/rfqStatus.vo';

export class RFQMapper {
  static toDomain(rfqDoc: RFQDocument): RFQEntity {
    const rfqEntity: RFQEntity = new RFQEntity({
      id: ID.of(rfqDoc.id),
      threadId: rfqDoc.threadId,
      summary: rfqDoc.summary,
      status: RFQStatusVO.of(rfqDoc.status),
      expectedDeliveryDate: rfqDoc.expectedDeliveryDate,

      notes: rfqDoc.notes ?? null,
      hasAttachments: rfqDoc.hasAttachments,
      error: rfqDoc.error || null,
      reason: rfqDoc.reason || null,

      customerDetail: {
        email: rfqDoc.customerDetail?.email,
        name: rfqDoc.customerDetail?.name || null,
      },
      items: rfqDoc.lineItems.map((item) => ({
        id: ID.of(item._id),
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
      })),
    });

    return rfqEntity;
  }

  static toDocument(rfq: RFQEntity): Partial<RFQDocument> {
    return {
      _id: rfq.getStorageId(),
      threadId: rfq.getEmailThreadRef(),
      status: rfq.getStatus().getValue(),
      summary: rfq.getSummary(),
      customerDetail: {
        name: rfq.getCustomerDetail().name,
        email: rfq.getCustomerDetail().email,
      },
      expectedDeliveryDate: rfq.getExpectedDeliveryDate(),
      hasAttachments: rfq.getHasAttachments(),
      notes: rfq.getNotes(),
      lineItems: rfq.getItems().map((item) => ({
        _id: item.id.getValue(),
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
      })),
      reason: rfq.getReason(),
      error: rfq.hasError() ? rfq.getError() : null,
      createdAt: rfq.getStorageId() ? rfq.getCreatedAt() : new Date(),
      updatedAt: DateHelper.getNowAsDate(),
    };
  }
}
