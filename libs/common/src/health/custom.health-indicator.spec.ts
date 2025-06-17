import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { HttpService } from '@nestjs/axios';
import { CustomHealthIndicator } from './custom.health-indicator';
import { of } from 'rxjs';

describe('CustomHealthIndicator', () => {
  let healthIndicator: CustomHealthIndicator;
  let configService: ConfigService;
  let httpService: HttpService;
  let healthService: HealthIndicatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomHealthIndicator,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: HealthIndicatorService,
          useValue: {
            check: jest.fn().mockReturnValue({
              up: jest.fn().mockReturnValue({}),
              down: jest.fn().mockReturnValue({}),
            }),
          },
        },
      ],
    }).compile();

    healthIndicator = module.get<CustomHealthIndicator>(CustomHealthIndicator);
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
    healthService = module.get<HealthIndicatorService>(HealthIndicatorService);
  });

  describe('checkAIProvider', () => {
    it('should return healthy status for valid Gemini configuration', async () => {
      // Arrange
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce('gemini') // AI_STRATEGY
        .mockReturnValueOnce('valid-api-key'); // GEMINI_API_KEY

      const mockResponse = {
        status: 200,
        data: {
          models: [{ name: 'model1' }, { name: 'model2' }],
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse) as any);

      const mockHealthCheck = {
        up: jest.fn().mockReturnValue({ 'ai-provider': { status: 'up' } }),
        down: jest.fn(),
      };
      jest
        .spyOn(healthService, 'check')
        .mockReturnValue(mockHealthCheck as any);

      // Act
      const result = await healthIndicator.checkAIProvider('ai-provider');

      // Assert
      expect(configService.get).toHaveBeenCalledWith('AI_STRATEGY', 'gemini');
      expect(configService.get).toHaveBeenCalledWith('GEMINI_API_KEY');
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
      );
      expect(mockHealthCheck.up).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'gemini',
          status: 200,
          modelsCount: 2,
        }),
      );
    });

    it('should return unhealthy status when API key is missing', async () => {
      // Arrange
      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce('gemini') // AI_STRATEGY
        .mockReturnValueOnce(undefined); // GEMINI_API_KEY

      const mockHealthCheck = {
        up: jest.fn(),
        down: jest.fn().mockReturnValue({ 'ai-provider': { status: 'down' } }),
      };
      jest
        .spyOn(healthService, 'check')
        .mockReturnValue(mockHealthCheck as any);

      // Act
      const result = await healthIndicator.checkAIProvider('ai-provider');

      // Assert
      expect(mockHealthCheck.down).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'gemini',
          error: 'GEMINI_API_KEY not configured',
        }),
      );
    });
  });

  describe('checkTelegramBot', () => {
    it('should return healthy status for valid bot token', async () => {
      // Arrange
      jest.spyOn(configService, 'get').mockReturnValue('valid-bot-token');

      const mockResponse = {
        data: {
          ok: true,
          result: {
            id: 123456789,
            username: 'test_bot',
            first_name: 'Test Bot',
            can_join_groups: true,
            can_read_all_group_messages: false,
            supports_inline_queries: true,
          },
        },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse) as any);

      const mockHealthCheck = {
        up: jest.fn().mockReturnValue({ 'telegram-bot': { status: 'up' } }),
        down: jest.fn(),
      };
      jest
        .spyOn(healthService, 'check')
        .mockReturnValue(mockHealthCheck as any);

      // Act
      const result = await healthIndicator.checkTelegramBot('telegram-bot');

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.telegram.org/botvalid-bot-token/getMe',
      );
      expect(mockHealthCheck.up).toHaveBeenCalledWith(
        expect.objectContaining({
          hasBotToken: true,
          botId: 123456789,
          botUsername: 'test_bot',
        }),
      );
    });
  });
});
