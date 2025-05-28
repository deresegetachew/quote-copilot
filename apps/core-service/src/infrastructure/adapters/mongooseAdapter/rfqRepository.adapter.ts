import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { PaginatedData, PaginatedDataFilters } from '@common';
import { Injectable } from '@nestjs/common';
import {
  RfqRepositoryPort,
  TSearchFields,
} from '../../../application/ports/outgoing/rfqRepository.port';
import { RFQEntity } from '../../../domain/entities/RFQ.entity';
import { RFQ, RFQDocument } from '../../database/mongo/schemas/rfq.schema';
import { RFQMapper } from '../../database/mongo/mappers/rfq.mapper';
import { ObjectId } from 'bson';
import {
  buildPaginatedAggregationPipeline,
  PaginatedQueryOptions,
} from './helper';

@Injectable()
export class RFQRepositoryAdapter extends RfqRepositoryPort {
  constructor(
    @InjectModel(RFQ.name)
    private readonly rfqModel: Model<RFQDocument>,
  ) {
    super();
  }

  async findById(id: string): Promise<RFQEntity | null> {
    const _id = new ObjectId(id);
    const rfq = await this.rfqModel.findById(_id).exec();

    return rfq ? RFQMapper.toDomain(rfq) : null;
  }

  async searchByFields(
    filters: PaginatedDataFilters<TSearchFields>,
  ): Promise<PaginatedData<RFQEntity>> {
    const query: any = this.generatePaginationQuery(filters);
    const pipeLineStages = buildPaginatedAggregationPipeline(query);

    const [result] = await this.rfqModel.aggregate(pipeLineStages).exec();
    const rfqs = result?.data || [];
    const totalCount = result?.totalCount || 0;

    const rfqEntities = rfqs.map((doc: RFQDocument) => RFQMapper.toDomain(doc));

    return {
      data: rfqEntities,
      totalCount: totalCount,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async save(entity: RFQEntity): Promise<void> {
    const rfqData = RFQMapper.toDocument(entity);

    await this.rfqModel.updateOne(
      { _id: rfqData._id },
      { $set: rfqData },
      { upsert: true },
    );
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
