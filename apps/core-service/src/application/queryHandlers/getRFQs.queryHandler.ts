import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRFQsQuery } from '../ports/incoming/query/getRFQs.query';
import { RfqRepositoryPort } from '../ports/outgoing/rfqRepository.port';
import { PaginatedData } from '@common';
import { RFQEntity } from '../../domain/entities/RFQ.entity';

export interface RFQResponseDTO {
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
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  
  // Frontend-specific fields
  partNumber: string;
  customer: string;
  aircraftType?: string;
  priority: string;
  date: string;
}

@QueryHandler(GetRFQsQuery)
export class GetRFQsQueryHandler implements IQueryHandler<GetRFQsQuery> {
  constructor(private readonly rfqRepository: RfqRepositoryPort) {}

  async execute(query: GetRFQsQuery): Promise<PaginatedData<RFQResponseDTO>> {
    const { page, pageSize, status, search } = query;

    // Build filters for the repository search with correct structure
    const filters = {
      page,
      pageSize,
      sortBy: 'createdAt',
      sortOrder: -1 as const,
      search: search || '',
      filters: {
        ...(status && { status }),
        ...(search && { email: search }),
      },
    };

    const result = await this.rfqRepository.searchByFields(filters);

    // Map RFQ entities to response DTOs
    const mappedData = result.data.map((rfq: RFQEntity) => this.mapToResponseDTO(rfq));

    return {
      data: mappedData,
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  private mapToResponseDTO(rfq: RFQEntity): RFQResponseDTO {
    const primaryItem = rfq.getItems()[0];
    
    return {
      id: rfq.getStorageId(),
      threadId: rfq.getEmailThreadRef(),
      summary: rfq.getSummary(),
      status: rfq.getStatus().getValue(),
      customerDetail: rfq.getCustomerDetail(),
      expectedDeliveryDate: rfq.getExpectedDeliveryDate(),
      hasAttachments: rfq.getHasAttachments(),
      notes: rfq.getNotes(),
      items: rfq.getItems().map(item => ({
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        quantity: item.quantity ?? 0,
        unit: item.unit,
        notes: item.notes,
      })),
      error: rfq.getError(),
      reason: rfq.getReason(),
      createdAt: rfq.getCreatedAt(),
      updatedAt: rfq.getUpdatedAt(),
      
      // Frontend-specific fields
      partNumber: primaryItem?.itemCode || 'N/A',
      customer: rfq.getCustomerDetail().name || rfq.getCustomerDetail().email,
      aircraftType: 'N/A',
      priority: this.mapStatusToPriority(rfq.getStatus().getValue()),
      date: rfq.getCreatedAt()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    };
  }

  private mapStatusToPriority(status: string): string {
    switch (status) {
      case 'NEW':
        return 'high';
      case 'PROCESSING':
        return 'medium';
      case 'PROCESSING_FAILED':
        return 'high';
      default:
        return 'normal';
    }
  }
}