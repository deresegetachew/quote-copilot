import { Test, TestingModule } from '@nestjs/testing';
import { DocumentWorkerController } from './document-worker.controller';
import { DocumentWorkerService } from './document-worker.service';

describe('DocumentWorkerController', () => {
  let documentWorkerController: DocumentWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DocumentWorkerController],
      providers: [DocumentWorkerService],
    }).compile();

    documentWorkerController = app.get<DocumentWorkerController>(DocumentWorkerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(documentWorkerController.getHello()).toBe('Hello World!');
    });
  });
});
