import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { PaginatedData, PaginatedDataFilters } from '@common';
import { Injectable } from '@nestjs/common';
import {
  RfqRepositoryPort,
  TSearchFields,
} from '../../../application/ports/outgoing/rfqRepository.port';
import { RFQ, RFQDocument } from '../../database/mongo/schemas/rfq.schema';
import { RFQMapper } from '../../database/mongo/mappers/rfq.mapper';
import {
  buildPaginatedAggregationPipeline,
  PaginatedQueryOptions,
} from './helper';
import { RFQAggregate } from '../../../domain/entities/RFQ.aggregate';

@Injectable()
export class RFQRepositoryAdapter extends RfqRepositoryPort {
  constructor(
    @InjectModel(RFQ.name)
    private readonly rfqModel: Model<RFQDocument>,
  ) {
    super();
  }

  async findById(id: string): Promise<RFQAggregate | null> {
    const rfq = await this.rfqModel.findById(id).exec();

    return rfq ? RFQMapper.toDomainAggregate(rfq) : null;
  }

  async findByThreadId(threadId: string): Promise<RFQAggregate | null> {
    const rfq = await this.rfqModel.findOne({ threadId }).exec();
    return rfq ? RFQMapper.toDomainAggregate(rfq) : null;
  }

  async searchByFields(
    filters: PaginatedDataFilters<TSearchFields>,
  ): Promise<PaginatedData<RFQAggregate>> {
    const query: any = this.generatePaginationQuery(filters);
    const pipeLineStages = buildPaginatedAggregationPipeline(query);

    const [result] = await this.rfqModel.aggregate(pipeLineStages).exec();
    const rfqs = result?.data || [];
    const totalCount = result?.totalCount || 0;

    const rfqEntities = rfqs.map((doc: RFQDocument) =>
      RFQMapper.toDomainAggregate(doc),
    );

    return {
      data: rfqEntities,
      totalCount: totalCount,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async save(entity: RFQAggregate): Promise<void> {
    const rfqData = RFQMapper.toPersistenceRFQ(entity);

    await this.rfqModel.replaceOne({ _id: rfqData._id }, rfqData, {
      upsert: true,
    });
  }

  private generatePaginationQuery({
    filters,
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
  }: PaginatedDataFilters<TSearchFields>): PaginatedQueryOptions {
    const query: PaginatedQueryOptions['filter'] = {};

    if (filters.threadId) {
      query.threadId = filters.threadId;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.email) {
      query['customerDetail.email'] = filters.email;
    }
    if (filters.hasAttachments !== undefined) {
      query.hasAttachments = filters.hasAttachments;
    }
    if (filters.createdAt) {
      query.createdAt = { $gte: filters.createdAt };
    }
    if (filters.updatedAt) {
      query.updatedAt = { $gte: filters.updatedAt };
    }

    if (search) {
      query.$or = [
        { summary: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const sortByQuery: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortOrder as 1 | -1 }
      : { createdAt: -1 };

    return {
      filter: query,
      page: page,
      pageSize: pageSize,
      sort: sortByQuery,
    };
  }
}
