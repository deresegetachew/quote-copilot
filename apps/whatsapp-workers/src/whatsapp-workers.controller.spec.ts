import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappWorkersController } from './whatsapp-workers.controller';
import { WhatsappWorkersService } from './services/whatsapp-workers.service';

describe('WhatsappWorkersController', () => {
  let whatsappWorkersController: WhatsappWorkersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappWorkersController],
      providers: [WhatsappWorkersService],
    }).compile();

    whatsappWorkersController = app.get<WhatsappWorkersController>(
      WhatsappWorkersController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(whatsappWorkersController.getHello()).toBe('Hello World!');
    });
  });
});
