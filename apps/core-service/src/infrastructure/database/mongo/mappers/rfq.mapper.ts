import { ObjectId } from 'bson';
import { RFQEntity } from '../../../../domain/entities/rfq.entity';
import { RFQDocument } from '../schemas/rfq.schema';
import { DateHelper } from '@common';
import { RFQStatusVO } from '../../../../domain/valueObjects/rfqStatus.vo';

export class RFQMapper {
  static toDomain(rfqDoc: RFQDocument): RFQEntity {
    const rfqEntity: RFQEntity = new RFQEntity({
      id: rfqDoc.id,
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
      _id: rfq.getStorageId()
        ? new ObjectId(rfq.getStorageId())
        : new ObjectId(),
      threadId: rfq.getEmailThreadRef(),
      status: rfq.getStatus().getValue(),
      summary: rfq.getSummary(),
      customerDetail: {
        name: rfq.getCustomerDetail().name ?? null,
        email: rfq.getCustomerDetail().email,
      },
      expectedDeliveryDate: rfq.getExpectedDeliveryDate(),
      hasAttachments: rfq.getHasAttachments(),
      notes: rfq.getNotes(),
      lineItems: rfq.getItems().map((item) => ({
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
