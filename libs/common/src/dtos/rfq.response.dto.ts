export class RFQResponseDTO {
  id: string;
  threadId: string;
  summary: string;
  status: string;
  customerDetail: {
    name: string | null;
    email: string;
  };
  expectedDeliveryDate: Date | null;
  hasAttachments: boolean | null;
  notes: string[] | null;
  items: Array<{
    itemCode: string;
    itemDescription: string | null;
    quantity: number;
    unit: string | null;
    notes: string[] | null;
  }>;
  error: string[] | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional fields for frontend compatibility
  partNumber: string; // Primary part number from first item
  customer: string; // Customer name or email
  aircraftType?: string; // Can be derived from part number or added later
  priority: string; // Derived from urgency or status
  date: string; // Formatted date string
} 