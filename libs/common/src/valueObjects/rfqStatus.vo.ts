export enum RFQStatus {
  NEW = 'NEW',
  PROCESSING = 'PROCESSING',
  PROCESSING_FAILED = 'PROCESSING_FAILED', // means requires human intervention
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}
