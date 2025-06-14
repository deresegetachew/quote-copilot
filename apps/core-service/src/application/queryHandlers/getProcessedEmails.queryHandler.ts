import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProcessedEmailsQuery } from '../ports/incoming/query/getProcessedEmails.query';
import { RfqRepositoryPort } from '../ports/outgoing/rfqRepository.port';

export interface ProcessedEmailResponseDTO {
  output: {
    customer: string;
    partNumber: string;
    quantity: number | string;
    urgency: string;
    email?: string;
    subject?: string;
    threadId?: string;
  };
}

@QueryHandler(GetProcessedEmailsQuery)
export class GetProcessedEmailsQueryHandler implements IQueryHandler<GetProcessedEmailsQuery> {
  constructor(private readonly rfqRepository: RfqRepositoryPort) {}

  async execute(query: GetProcessedEmailsQuery): Promise<ProcessedEmailResponseDTO[]> {
    try {
      // Get recent RFQs
      const rfqs = await this.rfqRepository.searchByFields({
        page: 1,
        pageSize: 50, // Recent requests
        sortBy: 'createdAt',
        sortOrder: -1,
        search: '',
        filters: {},
      });

      // Transform RFQs to match frontend expected format
      return rfqs.data.map(rfq => {
        const primaryItem = rfq.getItems()[0];
        const urgency = this.mapStatusToUrgency(rfq.getStatus().getValue());

        return {
          output: {
            customer: rfq.getCustomerDetail().name || rfq.getCustomerDetail().email,
            partNumber: primaryItem?.itemCode || 'N/A',
            quantity: primaryItem?.quantity || 'N/A',
            urgency,
            email: rfq.getCustomerDetail().email,
            subject: rfq.getSummary(),
            threadId: rfq.getEmailThreadRef(),
          },
        };
      });
    } catch (error) {
      console.error('Error fetching processed emails:', error);
      return [];
    }
  }

  private mapStatusToUrgency(status: string): string {
    switch (status) {
      case 'NEW':
        return 'urgent';
      case 'PROCESSING_FAILED':
        return 'urgent';
      case 'PROCESSING':
        return 'normal';
      default:
        return 'normal';
    }
  }
} 