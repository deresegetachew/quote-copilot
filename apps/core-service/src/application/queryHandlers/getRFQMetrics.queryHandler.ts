import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRFQMetricsQuery } from '../ports/incoming/query/getRFQMetrics.query';
import { RfqRepositoryPort } from '../ports/outgoing/rfqRepository.port';

export interface RFQMetricsResponseDTO {
  activeRequests: number;
  pendingQuotes: number;
  partsInProcess: number;
  completed: number;
}

@QueryHandler(GetRFQMetricsQuery)
export class GetRFQMetricsQueryHandler implements IQueryHandler<GetRFQMetricsQuery> {
  constructor(private readonly rfqRepository: RfqRepositoryPort) {}

  async execute(query: GetRFQMetricsQuery): Promise<RFQMetricsResponseDTO> {
    try {
      // Get all RFQs with basic pagination to calculate metrics
      const allRFQs = await this.rfqRepository.searchByFields({
        page: 1,
        pageSize: 1000, // Large enough to get all for metrics
        sortBy: 'createdAt',
        sortOrder: -1,
        search: '',
        filters: {},
      });

      // Calculate metrics based on status
      const activeRequests = allRFQs.data.filter(rfq => 
        ['NEW', 'PROCESSING'].includes(rfq.getStatus().getValue())
      ).length;

      const pendingQuotes = allRFQs.data.filter(rfq => 
        rfq.getStatus().getValue() === 'PROCESSING'
      ).length;

      const partsInProcess = allRFQs.data.reduce((total, rfq) => 
        total + rfq.getItems().length, 0
      );

      const completed = allRFQs.data.filter(rfq => 
        rfq.getStatus().getValue() === 'COMPLETED'
      ).length;

      return {
        activeRequests,
        pendingQuotes,
        partsInProcess,
        completed,
      };
    } catch (error) {
      // Return default values if there's an error
      return {
        activeRequests: 0,
        pendingQuotes: 0,
        partsInProcess: 0,
        completed: 0,
      };
    }
  }
} 