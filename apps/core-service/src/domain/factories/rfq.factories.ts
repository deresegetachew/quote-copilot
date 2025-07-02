import { DateHelper, ID } from '@common';
import { RFQStatusVO } from '../valueObjects/rfqStatus.vo';
import { RFQLineItemEntity } from '../entities/RFQLineItem.entity';
import { TEmailIntentResponseDTO } from '@common/dtos'; //this is a library we dont have dep on langchain just schema
import { RFQAggregate } from '../entities/RFQ.aggregate';

export class RFQFactory {
  static CUFromEmailIntentDTO(
    emailIntent: TEmailIntentResponseDTO, // use DTO here
    existingRFQ?: RFQAggregate,
  ): RFQAggregate {
    const isUpdate = !!existingRFQ;
    const rfq = existingRFQ || this.createBaseRFQ(emailIntent);
    this.applyEmailIntentData(rfq, emailIntent, isUpdate);

    rfq.addRFQParsedEvt();

    if (emailIntent.hasAttachments) {
      rfq.addParseRFQAttachmentsEvt();
    }

    return rfq;
  }

  private static createBaseRFQ(
    emailIntent: TEmailIntentResponseDTO,
  ): RFQAggregate {
    return new RFQAggregate({
      id: ID.create(),
      threadId: emailIntent?.storageThreadID || '',
      status: RFQStatusVO.initial(),
    });
  }

  private static applyEmailIntentData(
    rfq: RFQAggregate,
    emailIntent: TEmailIntentResponseDTO,
    isUpdate: boolean = false,
  ): void {
    const updates = [
      {
        condition: emailIntent.requestSummary,
        action: () => rfq.setRFQSummary(emailIntent.requestSummary),
      },
      {
        condition: emailIntent.customerDetail,
        action: () =>
          rfq.setCustomerDetail({
            name: emailIntent.customerDetail?.name || null,
            email:
              emailIntent.customerDetail?.email ||
              (isUpdate ? rfq.customerDetail?.email : '') ||
              '',
          }),
      },
      {
        condition: emailIntent.expectedDeliveryDate !== undefined,
        action: () =>
          rfq.setExpectedDeliveryDate(
            emailIntent.expectedDeliveryDate != null
              ? DateHelper.toUTCDateTime(emailIntent.expectedDeliveryDate)
              : null,
          ),
      },
      {
        condition: emailIntent.hasAttachments !== undefined,
        action: () =>
          rfq.setHasAttachments(emailIntent.hasAttachments || false),
      },
      {
        condition: emailIntent.notes,
        action: () => rfq.setNotes(emailIntent.notes),
      },
      {
        condition: emailIntent.reason,
        action: () => rfq.setReason(emailIntent.reason),
      },
      {
        condition: emailIntent.error,
        action: () => rfq.setError(emailIntent.error),
      },
      {
        condition: emailIntent.items,
        action: () => {
          if (isUpdate) rfq.clearRFQLineItems();
          this.addLineItemsToRFQ(rfq, emailIntent.items || []);
        },
      },
    ];

    updates
      .filter((update) => update.condition)
      .forEach((update) => update.action());
  }

  private static addLineItemsToRFQ(rfq: RFQAggregate, items: any[]): void {
    items.forEach((item) => {
      const lineItem = new RFQLineItemEntity(
        ID.create(),
        item.itemCode,
        item.quantity,
      );
      lineItem.description = item.itemDescription;
      lineItem.unit = item.unit;
      item.notes?.forEach?.((note) => lineItem.addNote(note));
      rfq.addRFQLineItem(lineItem);
    });
  }
}
