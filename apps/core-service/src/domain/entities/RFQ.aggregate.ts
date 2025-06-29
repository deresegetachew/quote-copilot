import { DateHelper, ID, TAggregateRoot } from '../../../../../libs/common/src';
import { RFQParsedDomainEvt } from '../events';
import { RFQStatusVO } from '../valueObjects/rfqStatus.vo';
import { RFQEntity, TRFQEntityProps } from './rfq.entity';
import { RFQLineItemEntity } from './RFQLineItem.entity';

export class RFQAggregate extends TAggregateRoot {
  private readonly rfqDetails: Omit<RFQEntity, 'lineItems'>;
  private readonly _lineItems: RFQLineItemEntity[] = [];

  constructor({ id, status, threadId }: TRFQEntityProps) {
    super(id);
    this.rfqDetails = new RFQEntity({
      id,
      threadId,
      status,
    });
  }

  createLineItem(code: string, quantity: number): RFQLineItemEntity {
    return new RFQLineItemEntity(ID.create(), code, quantity);
  }

  setRFQSummary(summary: string | null): RFQAggregate {
    this.rfqDetails.summary = summary;
    return this;
  }

  setCustomerDetail(detail: {
    name: string | null;
    email: string;
  }): RFQAggregate {
    if (name != null) this.rfqDetails.setCustomerDetailName(detail.name);
    this.rfqDetails.setCustomerDetailEmail(detail.email);
    return this;
  }

  setExpectedDeliveryDate(date: Date | null): RFQAggregate {
    this.rfqDetails.expectedDeliveryDate = date;
    return this;
  }

  setHasAttachments(hasAttachments: boolean): RFQAggregate {
    this.rfqDetails.hasAttachments = hasAttachments;
    return this;
  }

  setNotes(notes: string[] | null): RFQAggregate {
    notes?.forEach((note) => {
      this.rfqDetails.addNote(note);
    });
    return this;
  }

  setError(errors: string[] | null): RFQAggregate {
    errors?.forEach((error) => {
      this.rfqDetails.addError(error);
    });

    return this;
  }

  setReason(reason: string | null): RFQAggregate {
    this.rfqDetails.reason = reason;
    return this;
  }

  setCreatedAt(createdAt?: Date): RFQAggregate {
    this.rfqDetails.createdAt = createdAt ?? DateHelper.getNowAsDate();
    return this;
  }

  setUpdatedAt(updatedAt?: Date): RFQAggregate {
    this.rfqDetails.updatedAt = updatedAt ?? DateHelper.getNowAsDate();
    return this;
  }

  clearRFQLineItems(): RFQAggregate {
    this._lineItems.length = 0; // Clear the line items array
    return this;
  }

  addRFQLineItem(lineItem: RFQLineItemEntity): RFQAggregate {
    this._lineItems.push(lineItem);
    return this;
  }

  setLineItemCode(lineItemId: ID, code: string): RFQAggregate {
    const lineItem = this.rfqDetails.getLineItemById(lineItemId);
    if (lineItem) {
      lineItem.code = code;
    }
    return this;
  }

  setLineItemDescription(
    lineItemId: ID,
    description: string | null,
  ): RFQAggregate {
    const lineItem = this.rfqDetails.getLineItemById(lineItemId);
    if (lineItem) {
      lineItem.description = description;
    }
    return this;
  }

  setLineItemQuantity(lineItemId: ID, quantity: number): RFQAggregate {
    const lineItem = this.rfqDetails.getLineItemById(lineItemId);
    if (lineItem) {
      lineItem.quantity = quantity;
    }
    return this;
  }

  setLineItemUnit(lineItemId: ID, unit: string | null): RFQAggregate {
    const lineItem = this.rfqDetails.getLineItemById(lineItemId);
    if (lineItem) {
      lineItem.unit = unit;
    }
    return this;
  }

  setLineItemNotes(lineItemId: ID, notes: string[] | null): RFQAggregate {
    const lineItem = this.rfqDetails.getLineItemById(lineItemId);
    if (lineItem) {
      notes?.forEach((note) => {
        lineItem.addNote(note);
      });
    }
    return this;
  }

  // Getter methods for mappers
  getEmailThreadRef(): string {
    return this.rfqDetails.getEmailThreadRef();
  }

  get summary(): string | null {
    return this.rfqDetails.summary;
  }

  get customerDetail() {
    return this.rfqDetails.customerDetail;
  }

  get expectedDeliveryDate(): Date | null {
    return this.rfqDetails.expectedDeliveryDate;
  }

  get hasAttachments(): boolean | null {
    return this.rfqDetails.hasAttachments;
  }

  get notes(): string[] | null {
    return this.rfqDetails.notes;
  }

  get error(): string[] | null {
    return this.rfqDetails.error;
  }

  get reason(): string | null {
    return this.rfqDetails.reason;
  }

  get createdAt(): Date | undefined {
    return this.rfqDetails.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.rfqDetails.updatedAt;
  }

  get status(): RFQStatusVO {
    return this.rfqDetails.status;
  }

  get lineItems(): RFQLineItemEntity[] {
    return this._lineItems;
  }

  validate(): void {
    if (!this.rfqDetails.getEmailThreadRef()) {
      throw new Error('Thread ID is required');
    }
    if (!this.rfqDetails.summary) {
      throw new Error('RFQ summary is required');
    }
    if (!this.rfqDetails.customerDetail?.email) {
      throw new Error('Customer email is required');
    }
    if (
      this.rfqDetails.expectedDeliveryDate &&
      !(this.rfqDetails.expectedDeliveryDate instanceof Date)
    ) {
      throw new Error('Expected delivery date must be a valid date');
    }

    if (this._lineItems.length === 0) {
      throw new Error('At least one line item must be present in the RFQ');
    }

    this._lineItems.forEach((lineItem) => {
      if (!lineItem.code) {
        throw new Error('Line item code is required');
      }
      if (lineItem.quantity <= 0) {
        throw new Error('Line item quantity must be greater than zero');
      }
    });
  }

  addRFQParsedEvt(): void {
    this.clearDomainEvents();
    this.addDomainEvent(new RFQParsedDomainEvt(this.getEmailThreadRef(), this));
  }
}
