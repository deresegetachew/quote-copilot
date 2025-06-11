import { PipelineStage } from 'mongoose';

export interface PaginatedQueryOptions {
  filter?: Record<string, any>;
  page?: number;
  pageSize?: number;
  sort?: Record<string, 1 | -1>;
  project?: Record<string, any>;
}

export function buildPaginatedAggregationPipeline(
  options: PaginatedQueryOptions,
): PipelineStage[] {
  const {
    filter = {},
    page = 1,
    pageSize = 10,
    sort = {},
    project = {},
  } = options;

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 50);

  const matchStage: PipelineStage.Match = { $match: filter };
  const sortStage: PipelineStage.Sort | undefined =
    Object.keys(sort).length > 0 ? { $sort: sort } : undefined;
  const projectStage: PipelineStage.Project | undefined =
    Object.keys(project).length > 0 ? { $project: project } : undefined;
  const skipStage: PipelineStage.Skip = {
    $skip: (safePage - 1) * safePageSize,
  };
  const limitStage: PipelineStage.Limit = { $limit: safePageSize };

  const dataPipeline: PipelineStage.FacetPipelineStage[] = [
    ...(sortStage ? [sortStage] : []),
    ...(projectStage ? [projectStage] : []),
    skipStage,
    limitStage,
  ];

  const pipeline: PipelineStage[] = [
    matchStage,
    {
      $facet: {
        data: dataPipeline,
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  return pipeline;
}
