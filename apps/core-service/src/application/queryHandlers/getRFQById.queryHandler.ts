import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRFQByIdQuery } from '../ports/incoming/query/getRFQById.query';
import { RfqRepositoryPort } from '../ports/outgoing/rfqRepository.port';
import { RFQEntity } from '../../domain/entities/RFQ.entity';
import { RFQResponseDTO } from './getRFQs.queryHandler';

@QueryHandler(GetRFQByIdQuery)
export class GetRFQByIdQueryHandler implements IQueryHandler<GetRFQByIdQuery> {
  constructor(private readonly rfqRepository: RfqRepositoryPort) {}

  async execute(query: GetRFQByIdQuery): Promise<RFQResponseDTO> {
    const { id } = query;

    // Find RFQ by ID
    const rfq = await this.rfqRepository.findById(id);
    
    if (!rfq) {
      throw new Error(`RFQ with ID ${id} not found`);
    }

    // Map RFQ entity to response DTO
    return this.mapToResponseDTO(rfq);
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
      items: rfq.getItems(),
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