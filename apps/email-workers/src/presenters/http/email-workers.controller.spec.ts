import { Test, TestingModule } from '@nestjs/testing';
import { EmailWorkersController } from './email-workers.controller';
import { EmailWorkersService } from '../../service/email-workers.service';

describe('EmailWorkersController', () => {
  let emailWorkersController: EmailWorkersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [EmailWorkersController],
      providers: [EmailWorkersService],
    }).compile();

    emailWorkersController = app.get<EmailWorkersController>(
      EmailWorkersController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(emailWorkersController.getHello()).toBe('Hello World!');
    });
  });
});
