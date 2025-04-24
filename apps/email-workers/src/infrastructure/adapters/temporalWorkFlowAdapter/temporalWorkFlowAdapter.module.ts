import { Module } from '@nestjs/common';
import { ProcessEmailThreadWFPort } from '../../../application/ports/outgoing/processEmailThreadWF.port';
import { ProcessEmailThreadWFAdapter } from './processEmailThreadWF.adapter';
import { WorkflowModule } from '../../workflow/workflow.module';

@Module({
  imports: [WorkflowModule],
  providers: [
    ProcessEmailThreadWFAdapter,
    {
      provide: ProcessEmailThreadWFPort,
      useClass: ProcessEmailThreadWFAdapter,
    },
  ],
  exports: [ProcessEmailThreadWFPort],
})
export class TemporalWorkFlowAdapterModule {}
