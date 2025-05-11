import { Module } from '@nestjs/common';
import { ProcessRFQUseCase } from './useCases/processRFQ.useCase';

@Module({
  imports: [],
  controllers: [],
  providers: [ProcessRFQUseCase],
})
export class AppModule {}
