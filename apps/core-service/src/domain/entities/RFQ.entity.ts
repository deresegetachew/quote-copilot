import { DateHelper, ID } from '@common';
import { RFQStatusVO } from '../valueObjects/rfqStatus.vo';
import { RFQLineItemEntity } from './RFQLineItem.entity';

export type TRFQEntityProps = {
  id: ID;
  threadId: string;
  status: RFQStatusVO;
};

export class RFQEntity {
  private readonly id: ID;
  private readonly threadId: string;
  private _status: RFQStatusVO;
  private _summary: string | null;
  private _customerDetail: {
    name: string | null;
    email: string;
  } | null;

  private _expectedDeliveryDate: Date | null;
  private _hasAttachments: boolean | null;
  private _notes: string[] | null;
  private _lineItems: RFQLineItemEntity[];
  private _error: string[] | null;
  private _reason: string | null;
  private _createdAt: Date | undefined;
  private _updatedAt: Date | undefined;

  // constructor params is for fields that are required to create an RFQEntity
  constructor(props: TRFQEntityProps) {
    this.id = props.id;
    this.threadId = props.threadId;
    this._status = props.status;
  }

  getStorageId(): ID {
    return this.id;
  }

  getEmailThreadRef(): string {
    return this.threadId;
  }

  get summary(): string | null {
    return this._summary;
  }

  set summary(summary: string | null) {
    this._summary = summary;
  }

  get customerDetail() {
    return this._customerDetail;
  }

  setCustomerDetailName(name: string | null) {
    if (!this._customerDetail) {
      this._customerDetail = { name, email: '' };
    }
    this._customerDetail.name = name;
  }

  setCustomerDetailEmail(email: string) {
    if (!this._customerDetail) {
      this._customerDetail = { name: null, email };
      return;
    }

    this._customerDetail.email = email;
  }

  get expectedDeliveryDate(): Date | null {
    return this._expectedDeliveryDate;
  }

  set expectedDeliveryDate(date: Date | string | null) {
    if (!date) {
      this._expectedDeliveryDate = null;
    } else this._expectedDeliveryDate = DateHelper.toUTCDateTime(date);
  }

  get hasAttachments(): boolean | null {
    return this._hasAttachments;
  }

  set hasAttachments(hasAttachments: boolean | null) {
    this._hasAttachments = hasAttachments;
  }

  get notes(): string[] | null {
    return this._notes;
  }

  addNote(note: string | null): void {
    if (!note) return;
    if (!this._notes) {
      this._notes = [note];
    }
    this._notes.push(note);
  }

  get lineItems(): RFQLineItemEntity[] {
    return this._lineItems;
  }

  addLineItem(item: RFQLineItemEntity) {
    if (!this._lineItems) {
      this._lineItems = [item];
    } else this._lineItems.push(item);
  }

  get error(): string[] | null {
    return this._error;
  }

  addError(error: string) {
    if (!this._error) {
      this._error = [error];
    } else this._error.push(error);
  }

  get reason(): string | null {
    return this._reason;
  }

  set reason(reason: string | null) {
    this._reason = reason;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  set createdAt(date: Date | undefined) {
    this._createdAt = date;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  set updatedAt(date: Date | undefined) {
    this._updatedAt = date;
  }

  get status(): RFQStatusVO {
    return this._status;
  }

  set status(newStatus: RFQStatusVO) {
    if (!this._status.canTransitionTo(newStatus.toString())) {
      throw new Error(
        `Cannot transition from ${this.status.getValue()} to ${newStatus.getValue()}`,
      );
    } else this._status = newStatus;
  }

  getLineItemById(id: ID): RFQLineItemEntity | null {
    return (
      this._lineItems.find((item) => item.getStorageId().equals(id)) || null
    );
  }
}
