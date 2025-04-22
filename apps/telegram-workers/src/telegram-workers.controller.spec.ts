import { Test, TestingModule } from '@nestjs/testing';
import { TelegramWorkersController } from './telegram-workers.controller';
import { TelegramWorkersService } from './services/telegram-workers.service';

describe('TelegramWorkersController', () => {
  let telegramWorkersController: TelegramWorkersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TelegramWorkersController],
      providers: [TelegramWorkersService],
    }).compile();

    telegramWorkersController = app.get<TelegramWorkersController>(
      TelegramWorkersController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(telegramWorkersController.getHello()).toBe('Hello World!');
    });
  });
});
