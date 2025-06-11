import { ID } from '@common';
import { RFQStatusVO } from '../valueObjects/rfqStatus.vo';

type TRFQEntityProps = {
  id: ID | null;
  threadId: string;
  summary: string;
  status: RFQStatusVO;
  customerDetail: {
    name: string | null;
    email: string;
  };
  expectedDeliveryDate: Date | null;
  hasAttachments: boolean | null;
  notes: string[] | null;
  items: Array<{
    id: ID;
    itemCode: string;
    itemDescription: string | null;
    quantity: number | null;
    unit: string | null;
    notes: string[] | null;
  }>;
  error: string[] | null; // Changed from object to string[] for simplicity
  reason: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class RFQEntity {
  private readonly id: ID;
  private readonly threadId: string;
  private readonly summary: string;
  private readonly customerDetail: {
    name: string | null;
    email: string;
  };
  private status: RFQStatusVO;
  private readonly expectedDeliveryDate: Date | null;
  private readonly hasAttachments: boolean | null;
  private readonly notes: string[] | null;
  private readonly items: Array<TRFQEntityProps['items'][number]>;
  private readonly error: TRFQEntityProps['error'] | null;
  private readonly reason: string | null;
  private readonly createdAt: Date | undefined;
  private readonly updatedAt: Date | undefined;

  constructor(props: TRFQEntityProps) {
    this.id = props.id ?? ID.create();
    this.threadId = props.threadId;
    this.summary = props.summary;
    this.status = props.status;
    this.customerDetail = props.customerDetail;
    this.expectedDeliveryDate = props.expectedDeliveryDate;
    this.hasAttachments = props.hasAttachments;
    this.notes = props.notes;
    this.items = props.items;
    this.error = props.error || null;
    this.reason = props.reason || null;
    this.createdAt = props.createdAt || undefined;
    this.updatedAt = props.updatedAt || undefined;
  }

  getStorageId(): string {
    return this.id.getValue();
  }

  getEmailThreadRef(): string {
    return this.threadId;
  }

  getSummary(): string {
    return this.summary;
  }

  getCustomerDetail() {
    return this.customerDetail;
  }

  getExpectedDeliveryDate(): Date | null {
    return this.expectedDeliveryDate;
  }

  getHasAttachments(): boolean | null {
    return this.hasAttachments;
  }

  getNotes(): string[] | null {
    return this.notes;
  }

  getItems(): Array<{
    id: ID;
    itemCode: string;
    itemDescription: string | null;
    quantity: number | null;
    unit: string | null;
    notes: string[] | null;
  }> {
    return this.items;
  }

  hasError(): boolean {
    return this.error !== null;
  }

  getError(): string[] | null {
    return this.error;
  }

  getReason(): string | null {
    return this.reason;
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  getStatus(): RFQStatusVO {
    return this.status;
  }

  updateStatus(newStatus: RFQStatusVO): void {
    if (!this.status.canTransitionTo(newStatus.toString())) {
      throw new Error(
        `Cannot transition from ${this.status.getValue()} to ${newStatus.getValue()}`,
      );
    }

    this.status = newStatus;
  }
}
